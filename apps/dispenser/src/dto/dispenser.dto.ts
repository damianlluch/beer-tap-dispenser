import { IsEnum, IsNotEmpty, IsPositive, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import {BeerType, BrandName, DispenserStatus} from "../interfaces/dispenser.interface";

export class CreateDispenserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  flor_volume: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  totalLitres: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  price: number;

  @ApiProperty({enum: BrandName})
  @IsEnum(BrandName)
  @IsString()
  brandName: BrandName;

  @ApiProperty({enum: BeerType})
  @IsEnum(BeerType)
  @IsString()
  beerType: BeerType;
}

export class OpenDispenserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  uniqueName: string;
}

export class CloseDispenserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  uniqueName: string;
}
