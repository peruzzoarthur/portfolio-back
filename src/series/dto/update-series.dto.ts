import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateSeriesDto } from './create-series.dto';

export class UpdateSeriesDto extends PartialType(CreateSeriesDto) {
  @ApiPropertyOptional({ example: 'Nest.js and Swagger Documentation' })
  title?: string;


  @ApiPropertyOptional({ example: 'nest-swagger-documentation' })
  slug?: string;
}
