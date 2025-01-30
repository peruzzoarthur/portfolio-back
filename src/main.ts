import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { snapshot: true });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('OzzuPortfolio')
    .setDescription('A server for handling blog posts at my portfolio page.')
    .setVersion('1.0')
    .addTag('posts')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  const configService = app.get(ConfigService);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap();
