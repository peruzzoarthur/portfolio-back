import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { safeParse } from "src/utils/safe-parse";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file", {}))
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("Markdown file is required.");
    }

    this.validateFile(file);

    const content = file.buffer.toString("utf-8");
    const authorsIds: string[] = JSON.parse(createPostDto.authorsIds);
    const title: string = JSON.parse(createPostDto.title);
    const abstract: string = JSON.parse(createPostDto.abstract);
    const imagesPath: string = JSON.parse(createPostDto.imagesPath);

    const { updatedContent, images } = this.postsService.extractFromMd(
      content,
      imagesPath,
    );

    return this.postsService.create(
      Number(createPostDto.seriesId),
      title,
      abstract,
      authorsIds,
      updatedContent,
      images,
    );
  }

  private validateFile(file: Express.Multer.File) {
    if (!file.mimetype.includes("markdown")) {
      throw new HttpException(
        "Only .md files are allowed.",
        HttpStatus.BAD_REQUEST,
      );
    }

    const allowedExtensions = [".md"];
    const fileExtension = file.originalname.split(".").pop();
    if (!allowedExtensions.includes(`.${fileExtension}`)) {
      throw new HttpException(
        "Only .md files are allowed.",
        HttpStatus.BAD_REQUEST,
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new HttpException(
        "File size exceeds the 5MB limit.",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(":id")
  @UseInterceptors(FileInterceptor("file", {}))
  update(
    @Param("id") id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {

    const seriesId = safeParse<string>(updatePostDto.seriesId);
    const title = safeParse<string>(updatePostDto.title);
    const abstract = safeParse<string>(updatePostDto.abstract);
    const imagesPath = safeParse<string>(updatePostDto.imagesPath);
    const authorsIds = safeParse<string[]>(updatePostDto.authorsIds);

    if (file) {

      this.validateFile(file);

      // Process file content and extract md with images ref 
      const content = file.buffer.toString("utf-8");
      const { updatedContent, images } = this.postsService.extractFromMd(
        content,
        imagesPath,
      );

      // Update post with content and images
      return this.postsService.update(
        +id,
        seriesId ? Number(seriesId) : undefined,
        title,
        abstract,
        authorsIds,
        updatedContent,
        images,
      );
    }

    // Update post without file
    return this.postsService.update(
      +id,
      seriesId ? Number(seriesId) : undefined,
      title,
      abstract,
      authorsIds,
    );
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.postsService.remove(+id);
  }
}
