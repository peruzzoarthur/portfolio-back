import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { ImagesModule } from '../images/images.module';
import { SeriesModule } from '../series/series.module';
import { AuthorsModule } from '../authors/authors.module';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [
    CoreModule,
    ImagesModule,
    SeriesModule,
    AuthorsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule { }
