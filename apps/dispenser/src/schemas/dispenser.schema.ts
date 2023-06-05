import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  BeerType,
  BrandName,
  DispenserStatus,
} from "../interfaces/dispenser.interface";
export type DispenserDocument = Dispenser & Document;

@Schema()
export class Dispenser {
  @Prop({ type: Number, required: true })
  flow_volume: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: String, enum: BeerType, required: true })
  beerType: string;

  @Prop({ type: String, enum: BrandName, required: true })
  brand: string;

  @Prop({ type: String, enum: DispenserStatus, default: DispenserStatus.Close })
  status: string;

  @Prop({ type: String })
  uniqueName: string;
}

export const DispenserSchema = SchemaFactory.createForClass(Dispenser);
