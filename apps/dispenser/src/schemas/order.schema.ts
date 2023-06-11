import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Dispenser} from "./dispenser.schema";

@Schema()
export class Order {
    @Prop({ type: Number, required: true })
    litres: number;

    @Prop({ type: Number, required: true })
    price: number;

    @Prop({ type: Types.ObjectId, required: true, ref: Dispenser.name })
    beer: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
