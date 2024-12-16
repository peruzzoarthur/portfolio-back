import { IsInt, IsNumberString, IsString } from "class-validator";

export class CreatePostDto {
  @IsNumberString()
  seriesId: string;

  @IsString()
  title: string;

  @IsString()
  abstract: string;

  @IsString()
  imagesPath: string;

  @IsString()
  authorsIds: string;
}
