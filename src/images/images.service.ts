import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) { }

  async createImages(
    images: { filename: string; data: Buffer }[],
    postId: number,
  ) {
    const created = await Promise.all(
      images.map((image) => {
        return this.prisma.image.create({
          data: {
            filename: image.filename,
            data: image.data,
            postId: postId,
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
          // Using the compound unique key
          postId: postId,
          filename: filename,
        },
      },
    });

    if (!image) {
      throw new NotFoundException("Image not found");
    }

    return image;
  }
}
