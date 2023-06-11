import { Module } from "@nestjs/common";
import { DispenserController } from "./dispenser.controller";
import { DispenserService } from "./dispenser.service";
import { MongooseModule } from "@nestjs/mongoose";
import { DispenserSchema } from "./schemas/dispenser.schema";
import { DatabaseModule } from "@app/database";
import {TaskService} from "./task.service";
import {OrderSchema} from "./schemas/order.schema";

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      {
        name: "Dispensers",
        schema: DispenserSchema,
      },
      {
        name: "Orders",
        schema: OrderSchema,
      },
    ]),
  ],
  controllers: [DispenserController],
  providers: [DispenserService, TaskService],
})
export class DispenserModule {}
