import { NestFactory } from '@nestjs/core';
import {SwaggerModule, DocumentBuilder} from "@nestjs/swagger"
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors()

  const config = new DocumentBuilder()
  .setTitle("OzzuPortfolio")
  .setDescription("A server for handling my posts at my portfolio page.")
  .setVersion('0.1')
  .addTag('posts')
  .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)

  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
