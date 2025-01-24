import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateSeriesDto {
  @ApiProperty({example: "Nest.js and Swagger"})
  @IsString()
  title: string;

  @ApiProperty({example: "nestjs"})
  @IsString()
  slug: string;
}
