import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { IsString } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  file?: any;

  @ApiPropertyOptional({ example: '1' })
  seriesId?: string;

  @ApiPropertyOptional({ example: 'My updated post' })
  title?: string;

  @ApiPropertyOptional({ example: 'Updated random thoughts' })
  abstract?: string;

  @ApiPropertyOptional({ example: '/usr/photos/updated/' })
  imagesPath?: string;

  @ApiPropertyOptional({ example: ['1'] })
  authorsIds?: string;

  @ApiPropertyOptional({ description: "String list of tags used by Enum Tag (AWS,GIS,IAC,NEST,POSTGRES,PRISMA,PYTHON,REACT,TERRAFORM,TEST,TYPEORM,TYPESCRIPT)", example: 'NEST, AWS'  } )
  @IsString({ each: true })
  tags?: string;
}

