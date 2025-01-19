import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { ImagesModule } from 'src/images/images.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [ImagesModule, DatabaseModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule { }
