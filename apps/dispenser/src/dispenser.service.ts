import { Injectable } from "@nestjs/common";
import { ClientSession, Connection, Model, Types } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Dispenser, DispenserDocument } from "./schemas/dispenser.schema";
import { CreateDispenserInterface } from "./interfaces/dispenser.interface";

@Injectable()
export class DispenserService {
  constructor(
    @InjectModel("Dispensers")
    private dispenserModel: Model<Dispenser>,
    @InjectConnection() private readonly connection: Connection
  ) {}
  async create(
    dispenser: Dispenser | CreateDispenserInterface
  ): Promise<DispenserDocument> {
    try {
      let dispenserCreated;
      const session = await this.connection.startSession();
      await session.withTransaction(async () => {
        dispenserCreated = (
          await this.dispenserModel.create([dispenser], { session })
        )[0];
      });
      await session.endSession();
      return dispenserCreated;
    } catch (e) {
      console.error(e);
    }
  }

  async findByUniqueName(
      uniqueName: string
  ) {
    let dispenser;
    try {
      dispenser =  await this.dispenserModel.findOne({ uniqueName });
      console.log(dispenser, 'dispenser')
      return dispenser;
    } catch (e) {
      console.error(e);
    }
  }
}
