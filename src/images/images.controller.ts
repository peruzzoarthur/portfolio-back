import { Controller, Get, Param, Res } from "@nestjs/common";
import { ImagesService } from "./images.service";
import { Response } from "express";

@Controller("images")
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(":articleId/:filename")
  async getImage(
    @Param("articleId") articleId: string,
    @Param("filename") filename: string,
    @Res() res: Response,
  ) {
    const image = await this.imagesService.getImageByFilenameAndArticleId(
      Number(articleId),
      filename,
    );

    res.setHeader("Content-Type", "image/png");
    res.send(Buffer.from(image.data));
  }
}
