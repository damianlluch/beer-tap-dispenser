import { Test, TestingModule } from '@nestjs/testing';
import { DispenserService } from './dispenser.service';
import { Dispenser, DispenserDocument } from './schemas/dispenser.schema';
import {getConnectionToken, getModelToken, MongooseModule} from '@nestjs/mongoose';
import {BeerType, BrandName, CreateDispenserInterface, DispenserStatus} from './interfaces/dispenser.interface';

describe('DispenserService', () => {
    let service: DispenserService;

    const mockDispenserModel = {
        create: jest.fn(),
        findOne: jest.fn(),
        findByUniqueName: jest.fn(),
        updateOne: jest.fn(),
    };

    const mockConnection = {
        startSession: jest.fn().mockReturnValue({
            withTransaction: jest.fn().mockImplementation((fn) => {
                const mockSession = {};
                const result = fn(mockSession);
                return result;
            }),
            endSession: jest.fn(),
        }),
    };


    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DispenserService,
                {
                    provide: getModelToken('Dispensers'),
                    useValue: mockDispenserModel,
                },
                {
                    provide: getConnectionToken(),
                    useValue: mockConnection,
                },
            ],
        }).compile();

        service = module.get<DispenserService>(DispenserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new dispenser', async () => {
            const dispenser: CreateDispenserInterface = {
                flor_volume: 0.1,
                price: 2,
                brand: BrandName.Corona,
                totalLitres: 100,
                beerType: BeerType.IPA
            };
            mockDispenserModel.create.mockResolvedValue([dispenser]);
            const result = await service.create(dispenser);
            expect(result).toEqual(dispenser);
        });
    });
    describe('open', () => {
        it('should open an existing dispenser', async () => {
            const dispenser: Dispenser = {
                flow_volume: 0.1,
                price: 2,
                brand: BrandName.Corona,
                totalLitres: 100,
                litresDispensed: 0,
                beerType: BeerType.IPA,
                status: DispenserStatus.Closed,
                uniqueName: 'UniqueName',
            };
            mockDispenserModel.findOne.mockResolvedValue(dispenser);
            mockDispenserModel.updateOne.mockResolvedValue({ nModified: 1 });
            const result = await service.open(dispenser);
            expect(result).toEqual(true);
        });
    });
    describe('findByUniqueName', () => {
        it('should return an existing dispenser by unique name', async () => {
            const dispenser: Dispenser = {
                flow_volume: 0.1,
                price: 2,
                brand: BrandName.Corona,
                totalLitres: 100,
                litresDispensed: 0,
                beerType: BeerType.IPA,
                status: DispenserStatus.Open,
                uniqueName: 'UniqueName',
            };
            mockDispenserModel.findOne.mockResolvedValue(dispenser);
            const result = await service.findByUniqueName(dispenser.uniqueName);
            expect(result).toEqual(dispenser);
        });
    });
    describe('findByUniqueName', () => {
        it('should return null if dispenser does not exist', async () => {
            const uniqueName = 'NonExistingName';
            mockDispenserModel.findOne.mockResolvedValue(null);
            const result = await service.findByUniqueName(uniqueName);
            expect(result).toBeNull();
        });
    });




});
