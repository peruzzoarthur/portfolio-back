import * as fs from 'fs';
import * as path from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from 'src/prisma.service';
import { ImagesService } from 'src/images/images.service';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, PrismaService, ImagesService],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


describe('extractFromMd', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync('markdown-test-');
  });

  afterEach(() => {
    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should extract images from markdown content', () => {
    // Prepare test markdown content and images
    const testImage1Path = path.join(tempDir, 'image1.jpg');
    const testImage2Path = path.join(tempDir, 'image2.png');
    
    // Create test image files
    fs.writeFileSync(testImage1Path, Buffer.from('test image 1'));
    fs.writeFileSync(testImage2Path, Buffer.from('test image 2'));

    const markdownContent = `
# Test Document

Some text here.

![Test Image 1](image1.jpg)

More text.

![Test Image 2](image2.png)
    `;

    // Call the function
    const result = service.extractFromMd(markdownContent, tempDir);

    // Assertions
    expect(result.images).toHaveLength(2);
    expect(result.images[0].filename).toBe('image1.jpg');
    expect(result.images[1].filename).toBe('image2.png');
    
    // Check updated content
    expect(result.updatedContent).toContain('![Test Image 1](images/image1.jpg)');
    expect(result.updatedContent).toContain('![Test Image 2](images/image2.png)');
  });

  it('should ignore non-existent images', () => {
    const markdownContent = `
# Test Document

![Non-Existent Image](non-existing.jpg)
    `;

    // Call the function
    const result = service.extractFromMd(markdownContent, tempDir);

    // Assertions
    expect(result.images).toHaveLength(0);
    expect(result.updatedContent).toBe(markdownContent);
  });

  it('should handle complex markdown with multiple image types', () => {
    // Prepare test images
    const testJpgPath = path.join(tempDir, 'test.jpg');
    const testPngPath = path.join(tempDir, 'test.png');
    const testGifPath = path.join(tempDir, 'test.gif');
    
    // Create test image files
    fs.writeFileSync(testJpgPath, Buffer.from('jpg image'));
    fs.writeFileSync(testPngPath, Buffer.from('png image'));
    fs.writeFileSync(testGifPath, Buffer.from('gif image'));

    const markdownContent = `
# Complex Markdown

Images of various types:

![JPG Image](test.jpg)
![PNG Image](test.png)
![GIF Image](test.gif)

Some more text.
    `;

    // Call the function
    const result = service.extractFromMd(markdownContent, tempDir);

    // Assertions
    expect(result.images).toHaveLength(3);
    expect(result.images.map(img => img.filename)).toEqual(['test.jpg', 'test.png', 'test.gif']);
    
    // Check updated content paths
    expect(result.updatedContent).toContain('![JPG Image](images/test.jpg)');
    expect(result.updatedContent).toContain('![PNG Image](images/test.png)');
    expect(result.updatedContent).toContain('![GIF Image](images/test.gif)');
  });
});
});
