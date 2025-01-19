import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { PrismaClientExceptionFilter } from "./prisma-client-exception/prisma-client-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {snapshot: true});
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  const config = new DocumentBuilder()
    .setTitle("OzzuPortfolio")
    .setDescription("A server for handling blog posts at my portfolio page.")
    .setVersion("1.0")
    .addTag("posts")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
