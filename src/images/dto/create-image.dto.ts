import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    description: 'Image filename',
    example: 'my-blog-header.jpg',
  })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({
    description: 'Binary data of the image',
    type: 'string',
    format: 'binary',
  })
  @IsNotEmpty()
  data: Buffer;

  @ApiProperty({
    description: 'MIME type of the image',
    example: 'image/png',
  })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024576,
  })
  @IsInt()
  @IsPositive()
  size: number;

  @ApiPropertyOptional({
    description: 'Alternative text for accessibility',
    example: 'A scenic mountain landscape at sunset',
  })
  @IsString()
  @IsOptional()
  alt?: string;

  @ApiPropertyOptional({
    description: 'Image caption',
    example: 'Beautiful sunset captured in the Rocky Mountains',
  })
  @IsString()
  @IsOptional()
  caption?: string;

}
