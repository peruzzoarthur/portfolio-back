import { Test, TestingModule } from '@nestjs/testing';
import { CallHandler, ExecutionContext, HttpException } from '@nestjs/common';
import { MarkdownFileInterceptor } from './markdown-file.interceptor';
import { firstValueFrom, Observable, of } from 'rxjs';
import { createMock } from '@golevelup/ts-jest';

class TestableMarkdownFileInterceptor extends MarkdownFileInterceptor {
  public testFileFilter(
    req: any,
    file: Express.Multer.File,
    callback: Function,
  ) {
    return this.fileFilter(req, file, callback);
  }
  public async testIntercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    return this.intercept(context, next);
  }
}

describe('MarkdownFileInterceptor', () => {
  let interceptor: TestableMarkdownFileInterceptor;

  beforeEach(async () => {
    interceptor = new TestableMarkdownFileInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('fileFilter', () => {
    let callback: jest.Mock;

    beforeEach(() => {
      callback = jest.fn();
    });

    it('should accept valid markdown files', () => {
      const file = {
        mimetype: 'text/markdown',
        originalname: 'test.md',
      } as Express.Multer.File;

      // Access private method using type assertion
      interceptor.testFileFilter({}, file, callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should accept text/plain files with .md extension', () => {
      const file = {
        mimetype: 'text/plain',
        originalname: 'test.md',
      } as Express.Multer.File;

      interceptor.testFileFilter({}, file, callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should reject files with wrong mimetype', () => {
      const file = {
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      } as Express.Multer.File;

      interceptor.testFileFilter({}, file, callback);

      expect(callback).toHaveBeenCalledWith(expect.any(HttpException), false);
    });

    it('should reject files with wrong extension', () => {
      const file = {
        mimetype: 'text/markdown',
        originalname: 'test.txt',
      } as Express.Multer.File;

      interceptor.testFileFilter({}, file, callback);

      expect(callback).toHaveBeenCalledWith(expect.any(HttpException), false);
    });

    it.only('should handle actual file upload', async () => {
      jest.mock('@nestjs/platform-express', async () => ({
        FileInterceptor: jest.fn().mockImplementation(() => ({
          intercept: jest
            .fn()
            .mockImplementation((context, next) => next.handle()),
        })),
      }));

      const file = {
        fieldname: 'file',
        originalname: 'test.md',
        encoding: '7bit',
        mimetype: 'text/markdown',
        buffer: Buffer.from('# Test Content'),
        size: 13,
        destination: '/tmp',
        filename: 'test.md',
        path: '/tmp/test.md',
      } as Express.Multer.File;

      const mockRequest = {
        file,
        headers: {
          'content-type':
            'multipart/form-data; boundary=----WebKitFormBoundaryABC123',
          'transfer-encoding': 'chunked',
        },
        body: {},
        protocol: 'http',
        hostname: 'localhost',
        method: 'POST',
        originalUrl: '/upload',
        query: {},
        params: {},
        pipe: jest.fn().mockReturnThis(),
      };

      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      const mockHttpContext = {
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      };

      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => mockHttpContext,
      });

      const next = { handle: () => of({ file }) };
      const result = await interceptor.testIntercept(mockContext, next);

      const value = await firstValueFrom(result);
      expect(value).toHaveProperty('file');
      expect(value.file.mimetype).toBe('text/markdown');
      expect(value.file.originalname).toBe('test.md');
    });
    // it('should handle actual file upload', async () => {
    //   const file = {
    //     fieldname: 'file',
    //     originalname: 'test.md',
    //     encoding: '7bit',
    //     mimetype: 'text/markdown',
    //     buffer: Buffer.from('# Test Content'),
    //     size: 13,
    //   } as Express.Multer.File;
    //
    //   const mockRequest = {
    //     file,
    //   };
    //
    //   const mockContext = createMock<ExecutionContext>({
    //     switchToHttp: () => ({
    //       getRequest: () => mockRequest,
    //     }),
    //   });
    //
    //   const next = { handle: () => of('test') };
    //   const result = await interceptor.intercept(mockContext, next);
    //
    //   const value = await firstValueFrom(result);
    //   expect(value).toBe('test');
    // });

    it('should handle file size exceeding limit', async () => {
      const customInterceptor = new MarkdownFileInterceptor('file', 10); // 10 bytes limit
      const file = {
        fieldname: 'file',
        originalname: 'test.md',
        encoding: '7bit',
        mimetype: 'text/markdown',
        buffer: Buffer.alloc(100), // 100 bytes
        size: 100,
      } as Express.Multer.File;

      const callback = jest.fn();

      (customInterceptor as any).fileFilter({}, file, callback);

      expect(callback).toHaveBeenCalledWith(expect.any(HttpException), false);
    });
  });

  describe('intercept', () => {
    it('should process the request with file interceptor', async () => {
      const context = createMock<ExecutionContext>();
      const next = { handle: () => of('test') };

      const result = await interceptor.intercept(context, next);

      // Convert Observable to Promise for assertion
      const value = await new Promise((resolve) => {
        result.subscribe(resolve);
      });

      expect(value).toBe('test');
    });

    it('should use correct options', () => {
      const customInterceptor = new MarkdownFileInterceptor(
        'customField',
        1024,
      );

      expect((customInterceptor as any).fieldName).toBe('customField');
      expect((customInterceptor as any).maxSize).toBe(1024);
      expect((customInterceptor as any).multerOptions.limits.fileSize).toBe(
        1024,
      );
    });
  });
});
