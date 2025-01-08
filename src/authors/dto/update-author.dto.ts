import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAuthorDto } from './create-author.dto';

export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {
  @ApiPropertyOptional({ example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Plastic' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'https://avatars.githubusercontent.com/u/73316481?v=4' })
  pictureUrl?: string;
}

