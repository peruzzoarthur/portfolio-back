import { Module } from "@nestjs/common";
import { AuthorsModule } from "./authors/authors.module";
import { ImagesModule } from "./images/images.module";
import { PostsModule } from "./posts/posts.module";
import { SeriesModule } from "./series/series.module";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import * as Joi from "@hapi/joi";

@Module({
  imports: [
    PrismaModule,
    PostsModule,
    AuthorsModule,
    ImagesModule,
    SeriesModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        IS_LOCAL: Joi.boolean().required(),
        PORT: Joi.number()
      }),
      isGlobal: true,
    }),
  ],
  // providers: [PrismaService],
})
export class AppModule {}
