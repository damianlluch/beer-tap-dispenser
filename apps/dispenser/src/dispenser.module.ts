import { Module } from '@nestjs/common';
import { DispenserController } from './dispenser.controller';
import { DispenserService } from './dispenser.service';
import { MongooseModule } from "@nestjs/mongoose";
import { DispenserSchema } from "./schemas/dispenser.schema";
import { DatabaseModule } from '@app/database';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      {
        name: 'Dispensers',
        schema: DispenserSchema,
      },
    ]),
  ],
  controllers: [DispenserController],
  providers: [DispenserService],
})
export class DispenserModule {}
