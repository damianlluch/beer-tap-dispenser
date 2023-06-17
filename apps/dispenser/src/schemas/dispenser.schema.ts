import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  BeerType,
  BrandName,
  DispenserStatus,
} from "../interfaces/dispenser.interface";
import { Document } from 'mongoose';

export type DispenserDocument = Dispenser & Document;

@Schema()
export class Dispenser {
  @Prop({ type: Number, required: true })
  flow_volume: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  totalLitres: number;

  @Prop({ type: Number, required: false, default: 0 })
  litresDispensed: number;

  @Prop({ type: Number, required: false, default: 0 })
  totalInvoiced?: number;

  @Prop({ type: String, enum: BeerType, required: true })
  beerType: string;

  @Prop({ type: Date, required: false })
  timeOpen?: Date;

  @Prop({ type: String, enum: BrandName, required: true })
  brand: string;

  @Prop({ type: String, enum: DispenserStatus, default: DispenserStatus.Closed })
  status: string;

  @Prop({ type: String })
  uniqueName: string;

  @Prop({ type: Boolean, default: false, required: false })
  emptyDispenser?: boolean;
}

export const DispenserSchema = SchemaFactory.createForClass(Dispenser);
