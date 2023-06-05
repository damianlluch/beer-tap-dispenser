import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI)],
  providers: [DatabaseModule],
  exports: [DatabaseModule],
})
export class DatabaseModule {}
