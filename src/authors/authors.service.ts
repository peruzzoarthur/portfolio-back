import { Injectable } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}
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

  findOne(id: number) {
    return `This action returns a #${id} author`;
  }

  update(id: number, updateAuthorDto: UpdateAuthorDto) {
    return `This action updates a #${id} author`;
  }

  remove(id: number) {
    return `This action removes a #${id} author`;
  }
}
