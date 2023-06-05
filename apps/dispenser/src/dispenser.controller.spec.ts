import { Test, TestingModule } from '@nestjs/testing';
import { DispenserController } from './dispenser.controller';
import { DispenserService } from './dispenser.service';

describe('DispenserController', () => {
  let dispenserController: DispenserController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DispenserController],
      providers: [DispenserService],
    }).compile();

    dispenserController = app.get<DispenserController>(DispenserController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(dispenserController.getHello()).toBe('Hello World!');
    });
  });
});
