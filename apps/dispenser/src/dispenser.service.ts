import { Injectable } from "@nestjs/common";
import { ClientSession, Connection, Model, Types } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Dispenser, DispenserDocument } from "./schemas/dispenser.schema";
import {CreateDispenserInterface, DispenserStatus} from "./interfaces/dispenser.interface";
import {Order} from "./schemas/order.schema";

@Injectable()
export class DispenserService {
  constructor(
    @InjectModel("Dispensers")
    private dispenserModel: Model<Dispenser>,
    @InjectModel("Orders")
    private orderModel: Model<Order>,
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
  ): Promise<DispenserDocument | null> {
    let dispenser: DispenserDocument;
    try {
      dispenser = await this.dispenserModel.findOne({ uniqueName: uniqueName });
      return dispenser;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async open(dispenser: DispenserDocument | Dispenser): Promise<boolean> {
    try {
      const session = await this.connection.startSession();
      await session.withTransaction(async () => {
        await this.dispenserModel.updateOne(
            { uniqueName: dispenser.uniqueName },
            { $set: { status: DispenserStatus.Open, timeOpen: Date.now() }},
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

  calculateLitresConsumed(dispenser: DispenserDocument): number {
    const now = new Date();
    const secondsOpen = (now.getTime() - dispenser.timeOpen.getTime()) / 1000;
    return dispenser.flow_volume * secondsOpen;
  }

  calculateTotalPrice(dispenser: DispenserDocument, litresConsumed: number): number {
    return dispenser.price * litresConsumed;
  }

  private async updateLitresDispensed(dispenser: DispenserDocument, litresConsumed: number, session: ClientSession | null = null): Promise<boolean> {
    try {
      await this.dispenserModel.updateOne(
          { uniqueName: dispenser.uniqueName },
          { $inc: { litresDispensed: litresConsumed } },
          { session }
      );
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
        const litresConsumed = this.calculateLitresConsumed(dispenser);
        const totalPrice = this.calculateTotalPrice(dispenser, litresConsumed);

        const order: Order = {
          ...new Order(),
          beer: dispenser._id,
          price: totalPrice,
          litres: litresConsumed,
        }

        await this.orderModel.create([order], {session});
        const isDispenserEmpty = (dispenser.totalLitres - dispenser.litresDispensed - litresConsumed) <= 0;


        await this.updateLitresDispensed(dispenser, litresConsumed, session);

        await this.dispenserModel.updateOne(
            { uniqueName: dispenser.uniqueName },
            { $set: { status: DispenserStatus.Closed, timeOpen: null, emptyDispenser: isDispenserEmpty,
              }},
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
