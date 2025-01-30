import * as fs from 'fs';
import * as path from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { SeriesService } from '../series/series.service';
import { AuthorsService } from '../authors/authors.service';
import { ImagesService } from '../images/images.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Post, Tag } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDtoWithContentAndImages } from './dto/create-post-with-content-and-images.dto';

describe('PostsService', () => {
  let postsService: PostsService;
  let prismaService: PrismaService;
  let seriesService: SeriesService;
  let authorsService: AuthorsService;
  let imagesService: ImagesService;

  const mockPrismaService = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    author: {
      findMany: jest.fn(),
    },
    image: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    series: {
      findUnique: jest.fn(),
    },
  };
  const mockSeriesService = {
    findOne: jest.fn(),
  };

  const mockImagesService = {
    createImages: jest.fn(),
  };

  const mockAuthorsService = {
    findAuthorsByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SeriesService,
          useValue: mockSeriesService,
        },
        {
          provide: AuthorsService,
          useValue: mockAuthorsService,
        },
        {
          provide: ImagesService,
          useValue: mockImagesService,
        },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    prismaService = module.get<PrismaService>(PrismaService);
    seriesService = module.get<SeriesService>(SeriesService);
    authorsService = module.get<AuthorsService>(AuthorsService);
    imagesService = module.get<ImagesService>(ImagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockCreatePostDto: CreatePostDtoWithContentAndImages = {
      seriesId: '1',
      imagesPath: '/usr/random/dir',
      authorsIds: '1, 2',
      tags: 'REACT, NEST',
      title: 'Test Post',
      content: 'Test Content',
      abstract: 'Test Abstract',
      slug: 'test-post',
      images: [
        {
          filename: 'test.jpg',
          data: Buffer.from('test'),
          mimeType: 'image/jpeg',
          size: 1024,
          alt: 'Test image',
          caption: 'Test caption',
        },
      ],
    };

    const mockSeries = { id: 1, name: 'Test Series' };

    const mockAuthors = [
      { id: 1, name: 'Author 1' },
      { id: 2, name: 'Author 2' },
    ];

    const mockPost: Post = {
      id: 1,
      title: 'Test Post',
      content: 'Test Content',
      abstract: 'Test Abstract',
      slug: 'test-post',
      isDraft: true,
      seriesId: 1,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      // authors: [
      //   {
      //     id: 1,
      //     firstName: 'Author',
      //     lastName: '1',
      //     email: 'author1@test.com',
      //     bio: 'Test bio',
      //     socialLinks: JSON.stringify({
      //       github: 'https://github.com/author1',
      //     }),
      //     isActive: true,
      //   },
      // ],
      // series: {
      //   id: 1,
      //   title: 'Test Series',
      //   description: 'Test Description',
      //   slug: 'test-series',
      //   isActive: true,
      //   order: 1,
      // },
      // images: [
      //   {
      //     id: 1,
      //     filename: 'test.jpg',
      //     data: Buffer.from('test'),
      //     mimeType: 'image/jpeg',
      //     size: 1024,
      //     alt: 'Test image',
      //     caption: 'Test caption',
      //     order: 0,
      //     postId: 1,
      //   },
      // ],
      tags: [Tag.REACT, Tag.NEST],
    };

    it('should successfully create a post', async () => {
      // Setup mocks
      mockSeriesService.findOne.mockResolvedValue(mockSeries);
      mockAuthorsService.findAuthorsByIds.mockResolvedValue(mockAuthors);
      mockPrismaService.post.create.mockResolvedValue(mockPost);
      mockImagesService.createImages.mockResolvedValue(undefined);

      const result = await postsService.create(mockCreatePostDto);

      expect(result).toBe(mockPost);
      expect(mockSeriesService.findOne).toHaveBeenCalledWith(1);
      expect(mockAuthorsService.findAuthorsByIds).toHaveBeenCalledWith([1, 2]);
      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: {
          series: {
            connect: { id: 1 },
          },
          title: mockCreatePostDto.title,
          abstract: mockCreatePostDto.abstract,
          content: mockCreatePostDto.content,
          authors: {
            connect: [{ id: 1 }, { id: 2 }],
          },
          tags: mockCreatePostDto.tags
            .split(',')
            .map((tag) => tag.trim())
            .map((tag) => Tag[tag])
            .filter((tag) => !!tag),
          slug: mockCreatePostDto.slug,
        },
      });
      expect(mockImagesService.createImages).toHaveBeenCalledWith(
        mockCreatePostDto.images,
        mockPost.id,
      );
    });

    it('should throw an error if series is not found', async () => {
      mockSeriesService.findOne.mockResolvedValue(null);

      await expect(postsService.create(mockCreatePostDto)).rejects.toThrow(
        new HttpException(
          `No series found with ${mockCreatePostDto.seriesId}`,
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw an error if any author is not found', async () => {
      mockSeriesService.findOne.mockResolvedValue(mockSeries);
      mockAuthorsService.findAuthorsByIds.mockResolvedValue([
        { id: 1, name: 'Author 1' },
      ]);

      await expect(postsService.create(mockCreatePostDto)).rejects.toThrow(
        new HttpException(
          'No authors found with ids: 2.',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw an error if post creation fails', async () => {
      mockSeriesService.findOne.mockResolvedValue(mockSeries);
      mockAuthorsService.findAuthorsByIds.mockResolvedValue(mockAuthors);
      mockPrismaService.post.create.mockResolvedValue(null);

      await expect(postsService.create(mockCreatePostDto)).rejects.toThrow(
        new HttpException(
          'Failed to create post',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should handle duplicate tags', async () => {
      const dtoDuplicateTags = {
        ...mockCreatePostDto,
        tags: `${Tag.REACT}, ${Tag.REACT}, ${Tag.AWS}, ${Tag.AWS}`,
      };

      mockSeriesService.findOne.mockResolvedValue(mockSeries);
      mockAuthorsService.findAuthorsByIds.mockResolvedValue(mockAuthors);
      mockPrismaService.post.create.mockResolvedValue(mockPost);
      mockImagesService.createImages.mockResolvedValue(undefined);

      await postsService.create(dtoDuplicateTags);

      expect(mockPrismaService.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tags: [Tag.REACT, Tag.AWS],
          }),
        }),
      );
    });

    it('should handle empty authors array', async () => {
      const dtoNoAuthors = {
        ...mockCreatePostDto,
        authorsIds: '',
      };

      mockSeriesService.findOne.mockResolvedValue(mockSeries);
      mockPrismaService.post.create.mockResolvedValue(mockPost);
      mockImagesService.createImages.mockResolvedValue(undefined);

      await postsService.create(dtoNoAuthors);

      expect(mockAuthorsService.findAuthorsByIds).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const mockPosts = [
      {
        id: 1,
        title: 'Test Post 1',
        abstract: 'Abstract 1',
        authors: [{ id: 1, firstName: 'Arthur', lastName: 'Peruzzo' }],
        content: 'Content 1',
      },
      {
        id: 2,
        title: 'Test Post 2',
        abstract: 'Abstract 2',
        authors: [{ id: 2, firstName: 'Maria', lastName: 'Peruzzo' }],
        content: 'Content 2',
      },
    ];

    it('should return all posts with selected fields', async () => {
      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);

      const result = await postsService.findAll();

      expect(result).toEqual(mockPosts);
      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          title: true,
          abstract: true,
          authors: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              pictureUrl: true,
            },
          },
          content: true,
          updatedAt: true,
          tags: true,
        },
      });
    });
  });

  describe('findOne', () => {
    const mockPost = {
      id: 1,
      title: 'Test Post',
      abstract: 'Test Abstract',
      authors: [{ id: 1, firstName: 'Arthur', lastName: 'Peruzzo' }],
      content: 'Test Content',
      images: [{ id: 1, filename: 'test.jpg', data: Buffer.from('test') }],
      tags: [Tag.NEST],
    };

    it('should return a post by id', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      const result = await postsService.findOne(1);

      expect(result).toEqual(mockPost);
      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          title: true,
          abstract: true,
          authors: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              pictureUrl: true,
            },
          },
          content: true,
          images: {
            select: {
              filename: true,
              data: true,
              id: true,
            },
          },
          tags: true,
          updatedAt: true,
        },
      });
    });

    it('should throw an error if post is not found', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(postsService.findOne(666)).rejects.toThrow(
        new HttpException('Post not found.', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    const mockPost = {
      id: 1,
      title: 'Original Title',
      abstract: 'Original Abstract',
      content: 'Original Content',
      seriesId: 1,
      slug: 'original-title',
      isDraft: true,
      series: {
        id: 1,
        title: 'Original Series',
        description: 'Test Series',
        slug: 'original-series',
        isActive: true,
        order: 1,
      },
      authors: [
        {
          id: 1,
          firstName: 'Arthur',
          lastName: 'Peruzzo',
          email: 'arthur@test.com',
          bio: 'Test bio',
          socialLinks: JSON.stringify({
            github: 'https://github.com/arthur',
            linkedin: 'https://linkedin.com/in/arthur',
          }),
          isActive: true,
        },
        {
          id: 2,
          firstName: 'Maria',
          lastName: 'Ij',
          email: 'maria@test.com',
          bio: 'Test bio',
          socialLinks: JSON.stringify({
            github: 'https://github.com/maria',
            linkedin: 'https://linkedin.com/in/maria',
          }),
          isActive: true,
        },
      ],
      images: [
        {
          id: 1,
          filename: 'original1.jpg',
          data: Buffer.from('original image 1'),
          mimeType: 'image/jpeg',
          size: 1024,
          alt: 'Original image 1',
          caption: 'Original caption 1',
          postId: 1,
          order: 0,
        },
        {
          id: 2,
          filename: 'original2.jpg',
          data: Buffer.from('original image 2'),
          mimeType: 'image/jpeg',
          size: 1024,
          alt: 'Original image 2',
          caption: 'Original caption 2',
          postId: 1,
          order: 1,
        },
      ],
      tags: [Tag.NEST, Tag.PRISMA],
      publishedAt: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    const mockUpdateDto = {
      title: 'Updated Title',
      abstract: 'Updated Abstract',
      content: 'Updated Content',
      tags: `${Tag.NEST}, ${Tag.REACT}`,
      authorsIds: '3, 4',
      seriesId: '2',
      slug: 'updated-title',
      isDraft: false,
      images: [
        {
          filename: 'new1.jpg',
          data: Buffer.from('new image 1'),
          mimeType: 'image/jpeg',
          size: 1024,
          alt: 'New image 1',
          caption: 'New caption 1',
          order: 0,
        },
        {
          filename: 'new2.jpg',
          data: Buffer.from('new image 2'),
          mimeType: 'image/jpeg',
          size: 1024,
          alt: 'New image 2',
          caption: 'New caption 2',
          order: 1,
        },
      ],
    };
    const mockUpdatedPost = {
      ...mockPost,
      title: mockUpdateDto.title,
      abstract: mockUpdateDto.abstract,
      content: mockUpdateDto.content,
      seriesId: 2,
      series: {
        id: 2,
        title: 'New Series',
      },
      authors: [
        {
          id: 3,
          firstName: 'Miguel',
          lastName: 'Nodevolvo',
        },
        {
          id: 4,
          firstName: 'João',
          lastName: 'Plastic',
        },
      ],
      tags: mockUpdateDto.tags,
      updatedAt: new Date('2024-01-02'),
    };

    it('should successfully update a post', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockSeriesService.findOne.mockResolvedValue({
        id: 2,
        title: 'New Series',
      });
      mockAuthorsService.findAuthorsByIds.mockResolvedValue([
        { id: 3, firstName: 'Miguel', lastName: 'Nodevolvo' },
        { id: 4, firstName: 'João', lastName: 'Plastic' },
      ]);
      mockPrismaService.post.update.mockResolvedValue(mockUpdatedPost);

      const result = await postsService.update(1, mockUpdateDto);

      expect(result).toBeDefined();
      expect(result).toEqual(mockUpdatedPost);

      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          series: {
            connect: { id: 2 },
          },
          title: mockUpdateDto.title,
          abstract: mockUpdateDto.abstract,
          content: mockUpdateDto.content,
          authors: {
            connect: [{ id: 3 }, { id: 4 }],
          },
          tags: [Tag.NEST, Tag.REACT],
        },
      });

      expect(mockPrismaService.image.deleteMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: mockPost.images.map((i) => i.id),
          },
        },
      });

      expect(mockImagesService.createImages).toHaveBeenCalledWith(
        mockUpdateDto.images,
        mockPost.id,
      );
    });

    it('should throw an error if series is not found', async () => {
      mockSeriesService.findOne.mockResolvedValue(null);

      mockAuthorsService.findAuthorsByIds.mockResolvedValue([
        { id: 3, firstName: 'Miguel', lastName: 'Nodevolvo' },
        { id: 4, firstName: 'João', lastName: 'Plastic' },
      ]);

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      await expect(postsService.update(1, mockUpdateDto)).rejects.toThrow(
        new HttpException(
          `No series with id ${mockUpdateDto.seriesId}.`,
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw an error if author is not found', async () => {
      mockSeriesService.findOne.mockResolvedValue({
        id: 2,
        title: 'New Series',
      });
      mockAuthorsService.findAuthorsByIds.mockResolvedValue([{ id: 3 }]); // Only one author found

      await expect(postsService.update(1, mockUpdateDto)).rejects.toThrow(
        new HttpException(
          'No authors found with ids: 4.',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should handle partial updates without images', async () => {
      const partialUpdateDto = {
        title: 'Only Title Updated',
        abstract: 'Only Abstract Updated',
      };

      mockAuthorsService.findAuthorsByIds.mockResolvedValue(mockPost.authors);
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post.update.mockResolvedValue({
        ...mockPost,
        ...partialUpdateDto,
      });

      const result = await postsService.update(1, partialUpdateDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.image.deleteMany).not.toHaveBeenCalled();
      expect(mockImagesService.createImages).not.toHaveBeenCalled();
    });

    it('should update with valid Tag enums', async () => {
      const tagUpdateDto = {
        tags: 'AWS, GIS, NEST',
      };

      const tagsArray = Array.from(
        new Set(
          tagUpdateDto.tags
            .split(',')
            .map((item) => item.trim())
            .map((item) => Tag[item])
            .filter((tag) => !!tag),
        ),
      );

      mockAuthorsService.findAuthorsByIds.mockResolvedValue(mockPost.authors);
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post.update.mockResolvedValue({
        ...mockPost,
        tags: tagsArray,
      });

      const result = await postsService.update(1, tagUpdateDto);

      expect(result.tags).toEqual(
        expect.arrayContaining([Tag.AWS, Tag.GIS, Tag.NEST]),
      );
    });

    it('should maintain existing relationships when only updating content', async () => {
      const contentOnlyUpdate = {
        content: 'Updated content only',
      };

      mockAuthorsService.findAuthorsByIds.mockResolvedValue(mockPost.authors);
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post.update.mockResolvedValue({
        ...mockPost,
        content: contentOnlyUpdate.content,
      });

      const result = await postsService.update(1, contentOnlyUpdate);

      expect(result.seriesId).toEqual(mockPost.series.id);
      expect(result.tags).toEqual(mockPost.tags);
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      const mockDeletedPost = { id: 1, title: 'Deleted Post' };
      mockPrismaService.post.delete.mockResolvedValue(mockDeletedPost);

      const result = await postsService.remove(1);

      expect(result).toEqual(mockDeletedPost);
      expect(mockPrismaService.post.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('extractFromMd', () => {
    let tempDir: string;

    beforeEach(() => {
      // Create a temporary directory for test files
      tempDir = fs.mkdtempSync('markdown-test-');
    });

    afterEach(() => {
      // Clean up temporary directory
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should extract images from markdown content', () => {
      // Prepare test markdown content and images
      const testImage1Path = path.join(tempDir, 'image1.jpg');
      const testImage2Path = path.join(tempDir, 'image2.png');

      // Create test image files
      fs.writeFileSync(testImage1Path, Buffer.from('test image 1'));
      fs.writeFileSync(testImage2Path, Buffer.from('test image 2'));

      const markdownContent = `
# Test Document

Some text here.

![Test Image 1](image1.jpg)

More text.

![Test Image 2](image2.png)
    `;

      // Call the function
      const result = postsService.extractFromMd(markdownContent, tempDir);

      // Assertions
      expect(result.images).toHaveLength(2);
      expect(result.images[0].filename).toBe('image1.jpg');
      expect(result.images[1].filename).toBe('image2.png');

      // Check updated content
      expect(result.updatedContent).toContain(
        '![Test Image 1](images/image1.jpg)',
      );
      expect(result.updatedContent).toContain(
        '![Test Image 2](images/image2.png)',
      );
    });

    it('should ignore non-existent images', () => {
      const markdownContent = `
# Test Document

![Non-Existent Image](non-existing.jpg)
    `;

      // Call the function
      const result = postsService.extractFromMd(markdownContent, tempDir);

      // Assertions
      expect(result.images).toHaveLength(0);
      expect(result.updatedContent).toBe(markdownContent);
    });

    it('should handle complex markdown with multiple image types', () => {
      // Prepare test images
      const testJpgPath = path.join(tempDir, 'test.jpg');
      const testPngPath = path.join(tempDir, 'test.png');
      const testGifPath = path.join(tempDir, 'test.gif');

      // Create test image files
      fs.writeFileSync(testJpgPath, Buffer.from('jpg image'));
      fs.writeFileSync(testPngPath, Buffer.from('png image'));
      fs.writeFileSync(testGifPath, Buffer.from('gif image'));

      const markdownContent = `
# Complex Markdown

Images of various types:

![JPG Image](test.jpg)
![PNG Image](test.png)
![GIF Image](test.gif)

Some more text.
    `;

      // Call the function
      const result = postsService.extractFromMd(markdownContent, tempDir);

      // Assertions
      expect(result.images).toHaveLength(3);
      expect(result.images.map((img) => img.filename)).toEqual([
        'test.jpg',
        'test.png',
        'test.gif',
      ]);

      // Check updated content paths
      expect(result.updatedContent).toContain('![JPG Image](images/test.jpg)');
      expect(result.updatedContent).toContain('![PNG Image](images/test.png)');
      expect(result.updatedContent).toContain('![GIF Image](images/test.gif)');
    });
  });
});
