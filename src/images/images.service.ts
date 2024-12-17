import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async createImages(
    images: { filename: string; data: Buffer }[],
    postId: number,
  ) {
    const created = await Promise.all(
      images.map((image) => {
        return this.prisma.image.create({
          data: {
            filename: `${postId}_${image.filename}`,
            data: image.data,
            postId: postId,
          },
        });
      }),
    );
    return created;
  }

  async getImageByFilenameAndArticleId(postId: number, filename: string) {
    const image = await this.prisma.image.findUnique({
      where: { filename: filename, postId: postId },
    });

    if (!image) {
      throw new NotFoundException("Image not found");
    }

    return image;
  }
}
