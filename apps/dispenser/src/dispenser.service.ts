import { Injectable } from "@nestjs/common";
import { ClientSession, Connection, Model, Types } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Dispenser, DispenserDocument } from "./schemas/dispenser.schema";
import {CreateDispenserInterface, DispenserStatus} from "./interfaces/dispenser.interface";

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
  ): Promise<DispenserDocument> {
    let dispenser: DispenserDocument;
    try {
      dispenser = await this.dispenserModel.findOne({ uniqueName });
      console.log(dispenser, 'dispenser')
      return dispenser;
    } catch (e) {
      console.error(e);
    }
  }

  async open(dispenser: DispenserDocument): Promise<boolean> {
    try {
      const session = await this.connection.startSession();
      await session.withTransaction(async () => {
        await this.dispenserModel.updateOne(
            { uniqueName: dispenser.uniqueName },
            { $set: { status: DispenserStatus.Open }},
            session,
        );
      })
      await session.endSession();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async close(dispenser: DispenserDocument): Promise<boolean> {
    try {
      const session = await this.connection.startSession();
      await session.withTransaction(async () => {
        await this.dispenserModel.updateOne(
            { uniqueName: dispenser.uniqueName },
            { $set: { status: DispenserStatus.Closed }},
            session,
        );
      })
      await session.endSession();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
