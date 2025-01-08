import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { Tag } from '@prisma/client';

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
  authorsIds?: string[];

  @ApiPropertyOptional({ example: ['NEST', 'PRISMA'], enum: [Object.keys(Tag)] })
  tags?: Tag[];
}

