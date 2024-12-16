import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { AuthorsModule } from "./authors/authors.module";
import { ImagesModule } from "./images/images.module";
import { PostsModule } from "./posts/posts.module";
import { SeriesModule } from './series/series.module';

@Module({
  imports: [PostsModule, AuthorsModule, ImagesModule, SeriesModule],
  providers: [PrismaService],
})
export class AppModule {}
