import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateSeriesDto } from "./dto/create-series.dto";
import { UpdateSeriesDto } from "./dto/update-series.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SeriesService {
  constructor(private prisma: PrismaService) {}
  async create(createSeriesDto: CreateSeriesDto) {
    const checkSeries = await this.prisma.series.findUnique({
      where: {
        title: createSeriesDto.title,
      },
    });

    if (checkSeries) {
      throw new HttpException(
        "Series with this title already exists.",
        HttpStatus.CONFLICT,
      );
    }

    return await this.prisma.series.create({
      data: {
        title: createSeriesDto.title,
      },
    });
  }

  async findAll() {
    return await this.prisma.series.findMany();
  }

  async findOne(id: number) {
    const series = await this.prisma.series.findUnique({
      where: {
        id: id,
      },
    });

    if (!series) {
      throw new HttpException(
        `Series with id ${id} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return series;
  }

  async update(id: number, updateSeriesDto: UpdateSeriesDto) {
    const series = await this.prisma.series.findUnique({
      where: {
        id: id,
      },
    });

    if (!series) {
      throw new HttpException(
        `Series with id ${id} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.prisma.series.update({
      where: {
        id: id,
      },
      data: {
        title: updateSeriesDto.title,
      },
    });
  }

  async remove(id: number) {
    const series = await this.prisma.series.findUnique({
      where: {
        id: id,
      },
    });

    if (!series) {
      throw new HttpException(
        `Series with id ${id} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.prisma.series.delete({
      where: {
        id: id,
      },
    });
  }
}
