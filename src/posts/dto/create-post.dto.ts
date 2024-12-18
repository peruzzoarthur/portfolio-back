import { Tag } from "@prisma/client";
import { IsArray, IsEnum, IsNumberString, IsString } from "class-validator";

export class CreatePostDto {
  @IsNumberString()
  seriesId: string;

  @IsString()
  title: string;

  @IsString()
  abstract: string;

  @IsString()
  imagesPath: string;

  @IsArray()
  @IsString({ each: true })
  authorsIds: string[];

  @IsArray()
  @IsEnum(Tag, { each: true })
  tags: Tag[];
}
