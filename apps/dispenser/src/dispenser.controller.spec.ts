import { Test, TestingModule } from '@nestjs/testing';
import { DispenserController } from './dispenser.controller';
import { DispenserService } from './dispenser.service';
import { INestApplication} from '@nestjs/common';
import {DispenserStatus, BrandName, BeerType} from './interfaces/dispenser.interface';
import request from 'supertest';
import {AuthService} from "../../auth/src/auth.service";
import {UserService} from "../../auth/src/user.service";
import {JwtModule, JwtService} from "@nestjs/jwt";
import {User} from "../../auth/src/user.schema";
import {AuthController} from "../../auth/src/auth.controller";
import { getModelToken } from '@nestjs/mongoose';
import jwt from 'jsonwebtoken';
import {JwtAuthGuard} from "../../auth/src/auth.guard";

describe('DispenserController', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userService: UserService;
  let dispenserService: DispenserService;

  const mockDispenserService = {
    create: jest.fn(),
    findByUniqueName: jest.fn(),
    open: jest.fn(),
    closeManually: jest.fn(),
  };

  const state = {
    users: [],
  };

  const mockUserService = {
    create: (user) => {
      // Store the user in the state object
      state.users.push(user);
      return Promise.resolve(user);
    },
  };


  const mockAuthService = {
    login: ({ username }) => {
      const user = state.users.find((user) => user.username === username);
      if (user) {
        const token = jwt.sign({ username: 'test' }, 'SECRET', { expiresIn: '60s' });
        return Promise.resolve({ access_token: token });
      }
      throw new Error('User not found');
    },
  };

  mockUserService.create = jest.fn().mockImplementation(mockUserService.create);
  mockAuthService.login = jest.fn().mockImplementation(mockAuthService.login);

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [DispenserController, AuthController],
      providers: [
        {
          provide: DispenserService,
          useValue: mockDispenserService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: () => 'mockJwtToken', // mock token value
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {},
        },
      ],
      imports: [
        JwtModule.register({
          secret: 'SECRET',
          signOptions: { expiresIn: '60s' },
        }),
      ],
    }).overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dispenserService = moduleRef.get<DispenserService>(DispenserService);
    authService = moduleRef.get<AuthService>(AuthService);
    userService = moduleRef.get<UserService>(UserService);
  });

  beforeEach(async () => {
    const user = { username: 'test', password: 'test1234' };
    await userService.create(user);
    await authService.login(user);
  });

  it('POST /dispenser/ - should create a new dispenser', async () => {
    const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'test', password: 'test1234' })
        .expect(200);

    const token = loginResponse.body.access_token;

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
        .set('Authorization', `Bearer ${token}`)
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
    mockDispenserService.closeManually.mockResolvedValue(true);
    return request(app.getHttpServer())
        .put('/dispenser/closeDispenser')
        .send(closeDispenserDto)
        .expect(200);
  });
});
