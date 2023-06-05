import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export type DispenserDocument = Dispenser & Document;

@Schema()
export class Dispenser {
  @Prop({ type: Number, required: true })
  flow_volume: number;

  @Prop({ type: Number, required: true })
  price: number;
}

export const DispenserSchema = SchemaFactory.createForClass(Dispenser);
