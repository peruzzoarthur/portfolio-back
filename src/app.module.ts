import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ImagesModule } from './images/images.module';
import { SeriesModule } from './series/series.module';
import { AuthorsModule } from './authors/authors.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    PostsModule,
    ImagesModule,
    SeriesModule,
    AuthorsModule,
    DevtoolsModule.register({ http: process.env.NODE_ENV !== 'production' }),
    CoreModule,
  ],
})
export class AppModule { }


