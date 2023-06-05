import { Module } from "@nestjs/common";
import { DispenserModule } from "../../dispenser/src/dispenser.module";
import { MongooseModule } from "@nestjs/mongoose";
import * as dotenv from "dotenv";
dotenv.config();

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI), DispenserModule],
})
export class MainModule {}
