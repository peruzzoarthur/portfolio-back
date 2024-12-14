import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as path from 'path';
import { existsSync, readFileSync } from 'fs';
import { ImagesService } from 'src/images/images.service';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private imagesService: ImagesService,
  ) {}

  async create(
    title: string,
    abstract: string,
    authorsIds: string[],
    content: string,
    images: { filename: string; data: Buffer }[],
  ) {
    const post = await this.prisma.post.create({
      data: {
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
        'Failed to create post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.imagesService.createImages(images, post.id);

    return post;
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
      throw new HttpException('Article not found.', HttpStatus.NOT_FOUND);
    }
    return post;
  }

  async update(id: number, updateArticleDto: UpdatePostDto) {
    return await this.prisma.post.update({
      where: {
        id: id,
      },
      data: {
        title: updateArticleDto.title,
        abstract: updateArticleDto.abstract,
        content: updateArticleDto.content,
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.post.delete({
      where: {
        id: id,
      },
    });
  }
}
