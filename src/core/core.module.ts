import { Module } from '@nestjs/common';
import { ValidatedConfigModule } from '../config/config.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ValidatedConfigModule, PrismaModule],
  exports: [ValidatedConfigModule, PrismaModule],
})
export class CoreModule {}
