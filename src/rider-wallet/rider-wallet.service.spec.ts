import { Test, TestingModule } from '@nestjs/testing';
import { RiderWalletService } from './rider-wallet.service';

describe('RiderWalletService', () => {
  let service: RiderWalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiderWalletService],
    }).compile();

    service = module.get<RiderWalletService>(RiderWalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
