import {Injectable, Logger} from "@nestjs/common";
import { ClientSession, Connection, Model, Types } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Dispenser, DispenserDocument } from "./schemas/dispenser.schema";
import {Cron, CronExpression} from "@nestjs/schedule";
import {DispenserStatus} from "./interfaces/dispenser.interface";
import {DispenserService} from "./dispenser.service";

const maxLitresPerPerson: number = 1;
const maxOpenTime: number = 15 * 1000;
const maxRetryAttempts: number = 3;

@Injectable()
export class TaskService {
    constructor(
        @InjectModel("Dispensers")
        private dispenserModel: Model<Dispenser>,
        @InjectConnection() private readonly connection: Connection,
        private dispenserService: DispenserService,
    ) {}

    private async safeClose(dispenser: DispenserDocument, session: ClientSession | null = null) {
        for (let i = 0; i < 3; i++) {
            try {
                return await this.dispenserService.close(dispenser, session);
            } catch (e) {
                if (e.code !== 112) {  // si el error no es WriteConflict
                    throw e;
                }
            }
        }
        throw new Error(`Failed to close dispenser ${dispenser.uniqueName} after 3 attempts`);
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async checkDispensers() {
        let retryAttempts = 0;

        while (retryAttempts < maxRetryAttempts) {
            try {
                const session = await this.connection.startSession();
                await session.withTransaction(async () => {
                    const openDispensers= await this.dispenserModel.find({
                        status: DispenserStatus.Open
                    }).session(session);

                    const now = new Date();

                    for (const dispenser of openDispensers) {
                        const timeSinceOpen = now.getTime() - new Date(dispenser.timeOpen).getTime();

                        if (dispenser.litresDispensed >= maxLitresPerPerson || timeSinceOpen > maxOpenTime) {
                            await this.safeClose(dispenser, session);
                            console.log('Dispenser: ', dispenser.uniqueName, ' closed')
                        }
                    }
                })
                await session.endSession();
                break;
            } catch (e) {
                retryAttempts++;
                if (retryAttempts >= maxRetryAttempts) {
                    console.error(e);
                }
            }
        }
    }
}
