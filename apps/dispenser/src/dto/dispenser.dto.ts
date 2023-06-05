import { IsNotEmpty, IsPositive } from 'class-validator';

export class CreateDispenserDTO {
  @IsNotEmpty()
  @IsPositive()
  flor_volume: number;

  @IsNotEmpty()
  @IsPositive()
  price: number;
}
