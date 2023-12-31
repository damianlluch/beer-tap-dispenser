import {Injectable, NotFoundException} from "@nestjs/common";
import { ClientSession, Connection, Model, Types } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Dispenser, DispenserDocument } from "./schemas/dispenser.schema";
import {CreateDispenserInterface, DispenserStatus, TotalSpendingInterface} from "./interfaces/dispenser.interface";
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

  async closeManually(dispenser: DispenserDocument): Promise<boolean> {
    try {
      const session = await this.connection.startSession();
      await session.withTransaction(async () => {
        await this.close(dispenser, session)
      })
      await session.endSession();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async close(dispenser: DispenserDocument, session: ClientSession | null = null): Promise<boolean> {
    try {
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

        await this.dispenserModel.updateOne(
            { uniqueName: dispenser.uniqueName },
            { $set: {
              status: DispenserStatus.Closed,
              timeOpen: null,
              emptyDispenser: isDispenserEmpty,
              totalInvoiced: dispenser.totalInvoiced + totalPrice
              }, $inc: { litresDispensed: litresConsumed }},
            session,
        );
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async getDispenserInvoicedOrders(uniqueName: string): Promise<TotalSpendingInterface> {
    const dispenser = await this.dispenserModel.findOne({ uniqueName });

    if (!dispenser) {
      throw new NotFoundException('No dispenser found with this unique name');
    }

    const orders = await this.orderModel.find({ beer: dispenser._id }).select('-beer');

    return {
      totalInvoiced: dispenser.totalInvoiced,
      orders,
    };
  }

}
