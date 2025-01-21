import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import { existsSync, readFileSync } from 'fs';
import { ImagesService } from 'src/images/images.service';
import { CreatePostDtoWithContentAndImages } from './dto/create-post-with-content-and-images.dto';
import { Tag } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SeriesService } from 'src/series/series.service';
import { AuthorsService } from 'src/authors/authors.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private imagesService: ImagesService,
    private seriesService: SeriesService,
    private authorsService: AuthorsService,
  ) { }

  async create({
    seriesId,
    authorsIds,
    tags,
    title,
    images,
    content,
    abstract,
  }: CreatePostDtoWithContentAndImages) {
    // const series = await this.prisma.series.findUnique({where: {id: Number(seriesId)}});
    const series = this.seriesService.findOne(Number(seriesId));
    if (!series) {
      throw new HttpException(
        `No series found with ${seriesId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const authorsIdsArray = authorsIds.split(',').map((item) => item.trim());
    if (authorsIdsArray && authorsIds.length > 0) {
      const authorsIdsToNumber = authorsIdsArray.map((id) => Number(id));

      const authors =
        await this.authorsService.findAuthorsByIds(authorsIdsToNumber);

      const existingAuthorIds = authors.map((author) => author.id);
      const invalidAuthors = authorsIdsToNumber.filter(
        (id) => !existingAuthorIds.includes(id),
      );

      if (invalidAuthors.length > 0) {
        throw new HttpException(
          `No authors found with ids: ${invalidAuthors.join(', ')}.`,
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const post = await this.prisma.post.create({
      data: {
        series: {
          connect: { id: Number(seriesId) },
        },
        title,
        abstract,
        content,
        authors: {
          connect: authorsIdsArray.map((id) => ({ id: Number(id) })),
        },
        tags: tags
          .split(',')
          .map((item) => item.trim())
          .map((item) => Tag[item])
          .filter((tag) => !!tag),
      },
    });

    if (!post) {
      throw new HttpException(
        'Failed to create post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.imagesService.createImages(images, post.id);

    return post;
  }

  async findAll() {
    return await this.prisma.post.findMany({
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
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        updatedAt: true,
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
      },
    });
    if (!post) {
      throw new HttpException('Post not found.', HttpStatus.NOT_FOUND);
    }
    return post;
  }

  async update(
    id: number,
    {
      seriesId,
      tags,
      title,
      images,
      content,
      abstract,
      authorsIds,
    }: Partial<CreatePostDtoWithContentAndImages>,
  ) {
    if (seriesId) {
      const series = this.seriesService.findOne(Number(seriesId));
      if (!series) {
        throw new HttpException(
          `No series with id ${seriesId}.`,
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const authorsIdsArray = authorsIds.split(',').map((item) => item.trim());
    if (authorsIdsArray && authorsIds.length > 0) {
      const authorsIdsToNumber = authorsIdsArray.map((id) => Number(id));

      const authors =
        await this.authorsService.findAuthorsByIds(authorsIdsToNumber);

      const existingAuthorIds = authors.map((author) => author.id);
      const invalidAuthors = authorsIdsToNumber.filter(
        (id) => !existingAuthorIds.includes(id),
      );

      if (invalidAuthors.length > 0) {
        throw new HttpException(
          `No authors found with ids: ${invalidAuthors.join(', ')}.`,
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const post = await this.prisma.post.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        seriesId: true,
        authors: {
          select: {
            id: true,
          },
        },
        images: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!post) {
      throw new HttpException('Post not found.', HttpStatus.NOT_FOUND);
    }

    const updatedPost = await this.prisma.post.update({
      where: {
        id: id,
      },
      data: {
        series: {
          connect: { id: seriesId ? Number(seriesId) : post.seriesId },
        },
        title: title,
        abstract: abstract,
        content: content,
        authors: {
          connect: authorsIds
            ? authorsIdsArray.map((id) => ({ id: Number(id) }))
            : post.authors.map((author) => ({ id: author.id })),
        },
        tags: tags
          .split(',')
          .map((item) => item.trim())
          .map((item) => Tag[item])
          .filter((tag) => !tag),
        // tags: Array.from(new Set(tags.split(',').map((item) => item.trim()))),
      },
    });

    if (!updatedPost) {
      throw new HttpException(
        'Failed to update post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (content && images) {
      const postImages = post.images;

      await this.prisma.image.deleteMany({
        where: {
          id: {
            in: postImages.map((i) => i.id),
          },
        },
      });

      await this.imagesService.createImages(images, updatedPost.id);
    }

    return updatedPost;
  }

  async remove(id: number) {
    return await this.prisma.post.delete({
      where: {
        id: id,
      },
    });
  }

  async findUsedTags() {
    const posts = await this.prisma.post.findMany({
      select: {
        tags: true,
      },
    });
    return Array.from(new Set(posts.flatMap((p) => p.tags)));
  }

  extractFromMd(content: string, basePath: string) {
    // Array to store extracted image information
    const images: { filename: string; data: Buffer }[] = [];

    // Use regex to find and process Markdown image references
    const updatedContent = content.replace(
      /!\[.*?\]\((.*?)\)/g,
      (match, imagePath: string) => {
        // Resolve the full path of the image relative to the base path
        const fullPath = path.resolve(basePath, imagePath);

        // Check if the image file exists
        if (existsSync(fullPath)) {
          // Read the image file into a buffer
          const imageBuffer = readFileSync(fullPath);

          // Extract the filename from the image path
          const filename = path.basename(imagePath);

          // Add image info to the images array
          images.push({ filename, data: imageBuffer });

          // Update the image path in the Markdown content
          // Replace original path with a standardized 'images/' path
          return match.replace(imagePath, `images/${filename}`);
        }

        // If file doesn't exist, return the original match
        return match;
      },
    );

    // Return the modified content and extracted images
    return { updatedContent, images };
  }
}
