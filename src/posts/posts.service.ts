import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import * as path from "path";
import { existsSync, readFileSync } from "fs";
import { ImagesService } from "src/images/images.service";
import { SeriesService } from "src/series/series.service";
import { AuthorsService } from "src/authors/authors.service";
import { CreatePostDto } from "./dto/create-post.dto";

interface CreatePostDtoWithContentAndImages extends CreatePostDto {
  content: string;
  images: { filename: string; data: Buffer }[];
}

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private imagesService: ImagesService,
    private seriesService: SeriesService,
    private authorsService: AuthorsService,
  ) {}

  async create({
    seriesId,
    authorsIds,
    tags,
    title,
    images,
    content,
    abstract,
  }: CreatePostDtoWithContentAndImages) {
    const series = await this.seriesService.findOne(Number(seriesId));
    if (!series) {
      throw new HttpException(
        `No series found with ${this.seriesService}`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (authorsIds && authorsIds.length > 0) {
      const authorsIdsToNumber = authorsIds.map((id) => Number(id));

      const authors =
        await this.authorsService.findAuthorsByIds(authorsIdsToNumber);

      const existingAuthorIds = authors.map((author) => author.id);
      const invalidAuthors = authorsIdsToNumber.filter(
        (id) => !existingAuthorIds.includes(id),
      );

      if (invalidAuthors.length > 0) {
        throw new HttpException(
          `No authors found with ids: ${invalidAuthors.join(", ")}.`,
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
          connect: authorsIds.map((id) => ({ id: Number(id) })),
        },
        tags: Array.from(new Set(tags)),
      },
    });

    if (!post) {
      throw new HttpException(
        "Failed to create post",
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
          },
        },
        content: true,
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
        title: true,
        abstract: true,
        authors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      throw new HttpException("Post not found.", HttpStatus.NOT_FOUND);
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
      const series = await this.seriesService.findOne(Number(seriesId));

      if (!series) {
        throw new HttpException(
          `No series with id ${id}.`,
          HttpStatus.NOT_FOUND,
        );
      }
    }

    if (authorsIds && authorsIds.length > 0) {
      const authorsIdsToNumber = authorsIds.map((id) => Number(id));
      const authors = await this.prisma.author.findMany({
        where: { id: { in: authorsIdsToNumber } },
      });

      const existingAuthorIds = authors.map((author) => author.id);
      const invalidAuthors = authorsIdsToNumber.filter(
        (id) => !existingAuthorIds.includes(id),
      );

      if (invalidAuthors.length > 0) {
        throw new HttpException(
          `No authors found with ids: ${invalidAuthors.join(", ")}.`,
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
      throw new HttpException("Post not found.", HttpStatus.NOT_FOUND);
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
            ? authorsIds.map((id) => ({ id: Number(id) }))
            : post.authors.map((author) => ({ id: author.id })),
        },
        tags: Array.from(new Set(tags)),
      },
    });

    if (!updatedPost) {
      throw new HttpException(
        "Failed to create post",
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
