import { IsEnum, IsNotEmpty, IsPositive, IsString } from "class-validator";
import {BeerType, BrandName, DispenserStatus} from "../interfaces/dispenser.interface";

export class CreateDispenserDTO {
  @IsNotEmpty()
  @IsPositive()
  flor_volume: number;

  @IsNotEmpty()
  @IsPositive()
  price: number;

  @IsEnum(BrandName)
  @IsString()
  brandName: BrandName;

  @IsEnum(BeerType)
  @IsString()
  beerType: BeerType;
}

export class OpenDispenserDTO {
  @IsNotEmpty()
  @IsString()
  uniqueName: string;
}

export class CloseDispenserDTO {
  @IsNotEmpty()
  @IsString()
  uniqueName: string;
}