import { IsString } from "class-validator";

export class CreateSeriesDto {
  @IsString()
  title: string;
}
