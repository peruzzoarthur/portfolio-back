import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsJSON, IsOptional, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAuthorDto {
  @ApiProperty({ example: 'Arthur' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Peruzzo' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'peruzzoarthur@gmail.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: 'Full-stack developer passionate about TypeScript and NestJS',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://avatars.githubusercontent.com/u/73316481?v=4',
  })
  @IsUrl()
  @IsOptional()
  pictureUrl?: string;

  @ApiPropertyOptional({
    example: {
      github: 'https://github.com/peruzzoarthur',
      linkedin: 'https://linkedin.com/in/peruzzoarthur',
      twitter: 'https://twitter.com/peruzzoarthur',
    },
  })
  @IsJSON()
  @IsOptional()
  @Transform(({ value }) => {
    return typeof value === 'string' ? value : JSON.stringify(value);
  })
  socialLinks?: string;
}
