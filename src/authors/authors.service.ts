import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateAuthorDto } from "./dto/create-author.dto";
import { UpdateAuthorDto } from "./dto/update-author.dto";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) { }
  async create(createAuthorDto: CreateAuthorDto) {
    return await this.prisma.author.create({
      data: {
        firstName: createAuthorDto.firstName,
        lastName: createAuthorDto.lastName,
      },
    });
  }

  async findAll() {
    return await this.prisma.author.findMany();
  }

  
  async findAuthorsByIds(authorIds: number[]) {
    return this.prisma.author.findMany({
      where: { id: { in: authorIds } },
    });
  }

  async findOne(id: number) {
    const author = await this.prisma.author.findUnique({
      where: {
        id: id,
      },
    });
    if (!author) {
      throw new HttpException(
        `Author with ${id} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return author;
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) {
    const author = await this.prisma.author.findUnique({
      where: {
        id: id,
      },
    });
    if (!author) {
      throw new HttpException(
        `Author with ${id} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.prisma.author.update({
      where: { id: author.id },
      data: {
        firstName: updateAuthorDto.firstName,
        lastName: updateAuthorDto.lastName,
      },
    });
  }

  async remove(id: number) {
    const author = await this.prisma.author.findUnique({
      where: {
        id: id,
      },
    });
    if (!author) {
      throw new HttpException(
        `Author with ${id} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.prisma.author.delete({ where: { id: author.id } });
  }
}
