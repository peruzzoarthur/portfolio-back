import { FileInterceptor } from '@nestjs/platform-express';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

@Injectable()
export class MarkdownFileInterceptor implements NestInterceptor {
  private readonly fieldName: string;
  private readonly maxSize: number;
  private readonly multerOptions: MulterOptions;

  constructor(fieldName: string = 'file', maxSize: number = 5 * 1024 * 1024) {
    this.fieldName = fieldName;
    this.maxSize = maxSize;
    this.multerOptions = {
      limits: {
        fileSize: this.maxSize,
      },
      fileFilter: this.fileFilter.bind(this),
    };
  }

  private fileFilter(req: any, file: Express.Multer.File, callback: Function) {
    if (
      !file.mimetype.includes('markdown') &&
      !file.mimetype.includes('text/plain')
    ) {
      return callback(
        new HttpException(
          'Only .md files are allowed.',
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }

    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'md') {
      return callback(
        new HttpException(
          'Only .md files are allowed.',
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }

    callback(null, true);
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const fileInterceptor = new (FileInterceptor(
      this.fieldName,
      this.multerOptions,
    ))();
    return await fileInterceptor.intercept(context, next);
  }
}
