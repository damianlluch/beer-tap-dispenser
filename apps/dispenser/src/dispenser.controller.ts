import { DispenserService } from "./dispenser.service";
import { CreateDispenserDTO, OpenDispenserDTO } from "./dto/dispenser.dto";
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Put,
  Request,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { Dispenser, DispenserDocument } from "./schemas/dispenser.schema";
import {DispenserStatus} from "./interfaces/dispenser.interface";

@Controller("/dispenser")
export class DispenserController {
  constructor(private readonly dispenserService: DispenserService) {}

  @Post("/")
  async createDispenser(
    @Request() req: Request,
    @Res() res: Response,
    @Body() body: CreateDispenserDTO
  ) {
    console.log("POST /");
    console.log("Body:", JSON.stringify(body));
    try {
      const dispenser: Dispenser = {
        ...new Dispenser(),
        ...body,
        flow_volume: body.flor_volume,
        price: body.price,
        beerType: body.beerType,
        brand: body.brandName,
        uniqueName: body.brandName
          .replace(/ /g, "")
          .toLowerCase()
          .concat(body.beerType.replace(/ /g, "").toLowerCase()),
      };

      const dispenserCreated: DispenserDocument =
        await this.dispenserService.create(dispenser);
      return res.status(HttpStatus.OK).json({
        message: "Dispenser Created",
        dispenser: dispenserCreated,
      });
    } catch (e) {
      console.error(e);
    }
  }

  @Put("/open")
  async openDispenser(
    @Request() req: Request,
    @Res() res: Response,
    @Body() body: OpenDispenserDTO
  ) {
    console.log("PUT /open");
    console.log("Body:", JSON.stringify(body));
    try {
      const dispenserOpened: DispenserDocument =
        await this.dispenserService.findByUniqueName(body.uniqueName);

      if (!dispenserOpened) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: "The dispenser does not exist",
        });
      }

      if (dispenserOpened.status == DispenserStatus.Open) {
        return res.status(HttpStatus.NOT_ACCEPTABLE).json({
          message: "The dispenser is already open",
        });
      }
      const dispenserResult: boolean = await this.dispenserService.open(dispenserOpened);
      if (dispenserResult) {
        return res.status(HttpStatus.OK).json({
          message: "Dispenser successfully opened",
          dispenser: dispenserOpened,
        });
      } else {
        return res.status(HttpStatus.CONFLICT).json({
          message: "Error opening the dispenser",
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
}
