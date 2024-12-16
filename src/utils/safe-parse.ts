import { HttpException, HttpStatus } from "@nestjs/common";

export const safeParse = <T>(value?: string): T | undefined => {
  try {
    return value ? JSON.parse(value) : undefined;
  } catch {
    throw new HttpException(
      `Invalid JSON format in: ${value}`,
      HttpStatus.BAD_REQUEST,
    );
  }
};
