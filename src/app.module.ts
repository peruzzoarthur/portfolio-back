import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './database/database.module';
import { ImagesModule } from './images/images.module';
import { SeriesModule } from './series/series.module';
import { AuthorsModule } from './authors/authors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        IS_LOCAL: Joi.boolean().required(),
        PORT: Joi.number(),
      }),
    }),
    DatabaseModule,
    PostsModule,
    ImagesModule,
    SeriesModule,
    AuthorsModule,
    DevtoolsModule.register({ http: process.env.NODE_ENV !== 'production' }),
  ],
})
export class AppModule { }
