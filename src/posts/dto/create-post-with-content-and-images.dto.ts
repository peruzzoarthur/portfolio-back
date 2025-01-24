import { OmitType } from "@nestjs/swagger";
import { CreatePostDto } from "./create-post.dto";
import { CreateImageDto } from "src/images/dto/create-image.dto";

export class CreatePostDtoWithContentAndImages extends OmitType(CreatePostDto, ['file'] as const) {
  content: string;
  // images: { filename: string; data: Buffer }[];
  images: CreateImageDto[]
}

