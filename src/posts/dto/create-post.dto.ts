import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsString } from "class-validator";

export class CreatePostDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File

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


  @ApiProperty({ example: "dto-validation" })
  @IsString()
  slug: string;

  @ApiProperty({
    type: String,
    items: { type: 'string' },
    example: '1, 2',
    description: 'List of author IDs.',
  })
  @IsString({ each: true })
  authorsIds: string;

  @ApiProperty({ description: "String list of tags used by Enum Tag (AWS,GIS,IAC,NEST,POSTGRES,PRISMA,PYTHON,REACT,TERRAFORM,TEST,TYPEORM,TYPESCRIPT)", example: 'NEST, AWS'  } )
  @IsString({ each: true })
  tags: string;

  // @ApiProperty({ description: "List of tags used by Enum Tag.", example: 'NEST, AWS', enum: Tag, isArray: true })
  // @IsEnum(Tag, { each: true })
  // @IsArray()
  // tags: Tag[];
}
