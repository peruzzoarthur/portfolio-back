import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import * as path from "path";
import { existsSync, readFileSync } from "fs";
import { ImagesService } from "src/images/images.service";
import { UpdatePostDto } from "./dto/update-post.dto";

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private imagesService: ImagesService,
  ) {}

  async create(
    seriesId: number,
    title: string,
    abstract: string,
    authorsIds: string[],
    content: string,
    images: { filename: string; data: Buffer }[],
  ) {
    const post = await this.prisma.post.create({
      data: {
        series: {
          connect: { id: seriesId },
        },
        title,
        abstract,
        content,
        authors: {
          connect: authorsIds.map((id) => ({ id: Number(id) })),
        },
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
      },
    });
    if (!post) {
      throw new HttpException("Post not found.", HttpStatus.NOT_FOUND);
    }
    return post;
  }

  async update(
    id: number,
    seriesId?: number,
    title?: string,
    abstract?: string,
    authorsIds?: string[],
    content?: string,
    images?: { filename: string; data: Buffer }[],
  ) {
    if (seriesId) {
      const isSeries = await this.prisma.series.findUnique({
        where: { id: seriesId },
      });

      if (!isSeries) {
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
          connect: { id: seriesId ? seriesId : post.seriesId },
        },
        title: title,
        abstract: abstract,
        content: content,
        authors: {
          connect: authorsIds
            ? authorsIds.map((id) => ({ id: Number(id) }))
            : post.authors.map((author) => ({ id: author.id })),
        },
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
    const images: { filename: string; data: Buffer }[] = [];

    const updatedContent = content.replace(
      /!\[.*?\]\((.*?)\)/g,
      (match, imagePath: string) => {
        const fullPath = path.resolve(basePath, imagePath);

        if (existsSync(fullPath)) {
          const imageBuffer = readFileSync(fullPath);
          const filename = path.basename(imagePath);

          console.log(imageBuffer);
          images.push({ filename, data: imageBuffer });

          return match.replace(imagePath, `images/${filename}`);
        }
        return match;
      },
    );

    return { updatedContent, images };
  }
}