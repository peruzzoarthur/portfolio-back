import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { AuthorsModule } from "./authors/authors.module";
import { ImagesModule } from "./images/images.module";
import { PostsModule } from "./posts/posts.module";

@Module({
  imports: [PostsModule, AuthorsModule, ImagesModule],
  providers: [PrismaService],
})
export class AppModule {}
