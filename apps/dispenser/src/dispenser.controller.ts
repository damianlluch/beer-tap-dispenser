import { DispenserService } from "./dispenser.service";
import {CloseDispenserDTO, CreateDispenserDTO, GetDispenserDTO, OpenDispenserDTO} from "./dto/dispenser.dto";
import {
  Body,
  Controller, Get,
  HttpStatus,
  Post,
  Put,
  Request,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { Dispenser, DispenserDocument } from "./schemas/dispenser.schema";
import {DispenserStatus, TotalSpendingInterface} from "./interfaces/dispenser.interface";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UseGuards } from '@nestjs/common';
import {JwtAuthGuard} from "../../auth/src/auth.guard";

@ApiTags('dispenser')
@Controller("/dispenser")
export class DispenserController {
  constructor(private readonly dispenserService: DispenserService) {}

  @UseGuards(JwtAuthGuard)
  @Post("/")
  @ApiOperation({ summary: 'Create a new dispenser' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dispenser successfully created' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Dispenser already exists' })
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
        totalInvoiced: 0,
        totalLitres: body.totalLitres,
        emptyDispenser: false,
        brand: body.brandName,
        uniqueName: body.brandName
          .replace(/ /g, "")
          .toLowerCase()
          .concat(body.beerType.replace(/ /g, "").toLowerCase()),
      };

      const dispenserExist = await this.dispenserService.findByUniqueName(dispenser.uniqueName);
      if (dispenserExist) {
        return res.status(HttpStatus.CONFLICT).json({
          message: "Dispenser already exist",
        });
      }

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

  @Put("/openDispenser")
  @ApiOperation({ summary: 'Open a dispenser' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dispenser successfully opened' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'The dispenser does not exist' })
  @ApiResponse({ status: HttpStatus.NOT_ACCEPTABLE, description: 'The dispenser is already open' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Error opening the dispenser' })
  async openDispenser(
    @Request() req: Request,
    @Res() res: Response,
    @Body() body: OpenDispenserDTO
  ) {
    console.log("PUT /openDispenser");
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

  @Put("/closeDispenser")
  @ApiOperation({ summary: 'Close a dispenser' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dispenser successfully closed' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'The dispenser does not exist' })
  @ApiResponse({ status: HttpStatus.NOT_ACCEPTABLE, description: 'The dispenser is already closed' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Error closing the dispenser' })
  async closeDispenser(
      @Request() req: Request,
      @Res() res: Response,
      @Body() body: CloseDispenserDTO
  ) {
    console.log("PUT /closeDispenser");
    console.log("Body:", JSON.stringify(body));
    try {
      const dispenserClosed: DispenserDocument =
          await this.dispenserService.findByUniqueName(body.uniqueName);

      if (!dispenserClosed) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: "The dispenser does not exist",
        });
      }

      if (dispenserClosed.status == DispenserStatus.Closed) {
        return res.status(HttpStatus.NOT_ACCEPTABLE).json({
          message: `The dispenser ${dispenserClosed.brand} - ${dispenserClosed.beerType} is already closed`,
        });
      }
      const dispenserResult: boolean = await this.dispenserService.closeManually(dispenserClosed);
      if (dispenserResult) {
        return res.status(HttpStatus.OK).json({
          message: `Dispenser successfully closed ${dispenserClosed.brand} - ${dispenserClosed.beerType}`,
          dispenser: dispenserClosed,
        });
      } else {
        return res.status(HttpStatus.CONFLICT).json({
          message: `Error closing the dispenser ${dispenserClosed.brand} - ${dispenserClosed.beerType}`,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  @Get("/dispenserInvoicedOrders")
  @ApiOperation({ summary: 'Get the total amount invoiced and orders for a dispenser' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dispenser total invoiced and orders returned successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'The dispenser does not exist' })
  async getDispenserInvoicedOrders(
      @Res() res: Response,
      @Body() body: GetDispenserDTO
  ) {
    console.log("PUT /dispenserInvoicedOrders");
    console.log("Body:", JSON.stringify(body));
    let result: TotalSpendingInterface;
    try {
      const dispenser: DispenserDocument =
          await this.dispenserService.findByUniqueName(body.uniqueName);

      if (!dispenser) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: "The dispenser does not exist",
        });
      }
      result = await this.dispenserService.getDispenserInvoicedOrders(body.uniqueName);
      return res.status(HttpStatus.OK).json({
        message: `${dispenser.brand} - ${dispenser.beerType} - Total beer sold`,
        result: result,
      });
    } catch (e) {
      console.error(e);
    }
  }

}
