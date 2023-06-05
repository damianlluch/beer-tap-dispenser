import { DispenserService } from './dispenser.service';
import { CreateDispenserDTO } from './dto/dispenser.dto';
import {
  Body,
  Controller,
  HttpStatus,
  Post, Put,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Dispenser, DispenserDocument } from './schemas/dispenser.schema';

@Controller('/dispenser')
export class DispenserController {
  constructor(private readonly dispenserService: DispenserService) {}

  @Post('/')
  async createDispenser(
    @Request() req: Request,
    @Res() res: Response,
    @Body() body: CreateDispenserDTO,
  ) {
    console.log('POST /');
    console.log('Body:', JSON.stringify(body));
    try {
      const dispenser: Dispenser = {
        ...new Dispenser(),
        ...body,
        flow_volume: body.flor_volume,
        price: body.price,
        beerType: body.beerType,
        brand: body.brandName
      };

      const dispenserCreated: DispenserDocument =
        await this.dispenserService.create(dispenser);
      return res.status(HttpStatus.OK).json({
        message: 'Dispenser Created',
        dispenser: dispenserCreated,
      });
    } catch (e) {
      console.error(e);
    }
  }

  @Put('/')
  async changePriceDispenser(
      @Request() req: Request,
      @Res() res: Response,
      @Body() body: CreateDispenserDTO,
  ) {
    console.log('POST /');
    console.log('Body:', JSON.stringify(body));
    try {
      const dispenser: Dispenser = {
        ...new Dispenser(),
        ...body,
        flow_volume: body.flor_volume,
        price: body.price,
      };

      const dispenserCreated: DispenserDocument =
          await this.dispenserService.create(dispenser);
      return res.status(HttpStatus.OK).json({
        message: 'Dispenser Created',
        dispenser: dispenserCreated,
      });
    } catch (e) {
      console.error(e);
    }
  }
}
