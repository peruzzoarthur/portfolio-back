import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateAuthorDto {
  @ApiProperty({ example: "Arthur" })
  @IsString()
  firstName: string

  @ApiProperty({ example: "Peruzzo" })
  @IsString()
  lastName: string

  @ApiProperty({ example: "https://avatars.githubusercontent.com/u/73316481?v=4" })
  @IsString()
  pictureUrl: string
}




