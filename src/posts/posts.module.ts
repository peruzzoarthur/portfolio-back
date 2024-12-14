import { Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PrismaService } from "src/prisma.service";
import { ImagesService } from "src/images/images.service";
import { PostsController } from "./posts.controller";

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService, ImagesService],
})
export class PostsModule {}
