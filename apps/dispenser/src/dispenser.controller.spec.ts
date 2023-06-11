import { Test, TestingModule } from '@nestjs/testing';
import { DispenserController } from './dispenser.controller';
import { DispenserService } from './dispenser.service';
import { INestApplication } from '@nestjs/common';
import {DispenserStatus, BrandName, BeerType} from './interfaces/dispenser.interface';
import request from 'supertest';

describe('DispenserController', () => {
  let app: INestApplication;
  let dispenserService: DispenserService;

  const mockDispenserService = {
    create: jest.fn(),
    findByUniqueName: jest.fn(),
    open: jest.fn(),
    close: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [DispenserController],
      providers: [{ provide: DispenserService, useValue: mockDispenserService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dispenserService = moduleRef.get<DispenserService>(DispenserService);
  });

  it('POST /dispenser/ - should create a new dispenser', () => {
    const dispenserDto = {
      flor_volume: 0.1,
      price: 2,
      brandName: BrandName.Corona,
      totalLitres: 100,
      beerType: BeerType.IPA
    };
    mockDispenserService.create.mockResolvedValue(true);
    return request(app.getHttpServer())
        .post('/dispenser')
        .send(dispenserDto)
        .expect(200);
  });

  it('PUT /dispenser/openDispenser - should open an existing dispenser', () => {
    const openDispenserDto = { uniqueName: 'coronaIPA' };
    mockDispenserService.findByUniqueName.mockResolvedValue({ status: DispenserStatus.Closed });
    mockDispenserService.open.mockResolvedValue(true);
    return request(app.getHttpServer())
        .put('/dispenser/openDispenser')
        .send(openDispenserDto)
        .expect(200);
  });

  it('PUT /dispenser/closeDispenser - should close an existing dispenser', () => {
    const closeDispenserDto = { uniqueName: 'coronaIPA' };
    mockDispenserService.findByUniqueName.mockResolvedValue({ status: DispenserStatus.Open });
    mockDispenserService.close.mockResolvedValue(true);
    return request(app.getHttpServer())
        .put('/dispenser/closeDispenser')
        .send(closeDispenserDto)
        .expect(200);
  });

  afterEach(async () => {
    await app.close();
  });
});
