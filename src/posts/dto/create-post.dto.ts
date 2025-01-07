import { ApiProperty } from "@nestjs/swagger";
import { Tag } from "@prisma/client";
import { IsArray, IsEnum, IsNumberString, IsString } from "class-validator";

export class CreatePostDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty()
  @IsNumberString()
  seriesId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  abstract: string;

  @ApiProperty()
  @IsString()
  imagesPath: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  authorsIds: string[];

  @ApiProperty({ enum: Tag })
  @IsArray()
  @IsEnum(Tag, { each: true })
  tags: Tag[];
}
