import { ApiProperty } from "@nestjs/swagger";
import { Tag } from "@prisma/client";
import { IsArray, IsEnum, IsNumberString, IsString } from "class-validator";

export class CreatePostDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty({ example: "1" })
  @IsNumberString()
  seriesId: string;

  @ApiProperty({ example: "My first post" })
  @IsString()
  title: string;

  @ApiProperty({ example: "Random thoughts" })
  @IsString()
  abstract: string;

  @ApiProperty({ example: "/usr/photos/" })
  @IsString()
  imagesPath: string;

  @ApiProperty({ example: ["1"] })
  @IsArray()
  @IsString({ each: true })
  authorsIds: string[];

  @ApiProperty({ example: ["NEST", "PRISMA"], enum: [Object.keys(Tag)] })
  @IsArray()
  @IsEnum(Tag, { each: true })
  tags: Tag[];
}
