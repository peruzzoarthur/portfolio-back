import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        IS_LOCAL: Joi.boolean().required(),
        PORT: Joi.number(),
      }),
    }),
  ],
  exports: [NestConfigModule],
})
export class ValidatedConfigModule { }
