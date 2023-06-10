import {Injectable, Logger} from "@nestjs/common";
import { ClientSession, Connection, Model, Types } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Dispenser, DispenserDocument } from "./schemas/dispenser.schema";
import {Cron, CronExpression} from "@nestjs/schedule";
import {DispenserStatus} from "./interfaces/dispenser.interface";

const maxLitresPerPerson: number = 10;
const maxOpenTime: number = 15 * 1000;

@Injectable()
export class TaskService {
    constructor(
        @InjectModel("Dispensers")
        private dispenserModel: Model<Dispenser>,
        @InjectConnection() private readonly connection: Connection
    ) {}

    @Cron(CronExpression.EVERY_5_SECONDS)
    async checkDispensers() {
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
                        await this.dispenserModel.updateOne(
                            { uniqueName: dispenser.uniqueName },
                            { $set: { status: DispenserStatus.Closed }},
                            session,
                        );
                        console.log('Dispenser: ', dispenser.uniqueName, ' closed')
                    }
                }
            })
            await session.endSession();
        } catch (e) {
            console.error(e);
        }
    }
}
