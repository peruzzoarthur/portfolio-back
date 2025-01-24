import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async createImages(
    // images: { filename: string; data: Buffer }[],
    images: CreateImageDto[],
    postId: number,
  ) {
    const created = await Promise.all(
      images.map((image) => {
        return this.prisma.image.create({
          data: {
            filename: image.filename,
            data: image.data,
            postId: postId,
            mimeType: image.mimeType,
            size: image.size,
            caption: image.caption,
            alt: image.alt,
          },
        });
      }),
    );
    return created;
  }

  async getImageByFilenameAndPostId(postId: number, filename: string) {
    const image = await this.prisma.image.findUnique({
      where: {
        postId_filename: {
          postId: postId,
          filename: filename,
        },
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }
}
