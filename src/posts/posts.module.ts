import { Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { ImagesModule } from "src/images/images.module";
import { AuthorsModule } from "src/authors/authors.module";
import { SeriesModule } from "src/series/series.module";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [ImagesModule, AuthorsModule, SeriesModule, PrismaModule],
  controllers: [PostsController],
  providers: [PostsService], 
})
export class PostsModule {}
