import { IsString } from "class-validator";

export class CreatePostDto {
  @IsString()
  title: string
  @IsString()
  abstract: string

  @IsString()
  imagesPath: string

  authorsIds: string

  content: string
}
