import { Module } from "@nestjs/common";
import { DispenserModule } from "../../dispenser/src/dispenser.module";
import { MongooseModule } from "@nestjs/mongoose";
import * as dotenv from "dotenv";
import { ScheduleModule } from '@nestjs/schedule';
import {AuthModule} from "../../auth/src/auth.module";

dotenv.config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    DispenserModule,
    AuthModule
  ],
})
export class MainModule {}
