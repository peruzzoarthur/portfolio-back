import { Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PrismaService } from "src/prisma.service";
import { ImagesService } from "src/images/images.service";
import { PostsController } from "./posts.controller";
import { AuthorsService } from "src/authors/authors.service";
import { SeriesService } from "src/series/series.service";

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService, ImagesService, AuthorsService, SeriesService],
})
export class PostsModule {}
