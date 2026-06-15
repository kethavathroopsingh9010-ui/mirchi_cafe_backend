import { Test, TestingModule } from '@nestjs/testing';
import { RiderWalletController } from './rider-wallet.controller';

describe('RiderWalletController', () => {
  let controller: RiderWalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RiderWalletController],
    }).compile();

    controller = module.get<RiderWalletController>(RiderWalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
