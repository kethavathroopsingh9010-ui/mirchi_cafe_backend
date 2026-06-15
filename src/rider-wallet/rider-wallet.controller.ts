import {
  Controller,
  Post,
  Get,
  Param,
  Body,
} from '@nestjs/common';

import { RiderWalletService } from './rider-wallet.service';

import { CreditWalletDto } from './dto/credit-wallet.dto';
import { DebitWalletDto } from './dto/debit-wallet.dto';

@Controller('rider-wallet')
export class RiderWalletController {
  constructor(private readonly walletService: RiderWalletService) {}

  @Post('create/:riderId')
  createWallet(@Param('riderId') riderId: string) {
    return this.walletService.createWallet(riderId);
  }

  @Post('credit/:riderId')
  creditWallet(
    @Param('riderId') riderId: string,
    @Body() dto: CreditWalletDto,
  ) {
    return this.walletService.credit(riderId, dto.amount);
  }

  @Post('debit/:riderId')
  debitWallet(
    @Param('riderId') riderId: string,
    @Body() dto: DebitWalletDto,
  ) {
    return this.walletService.debit(riderId, dto.amount);
  }

  @Get(':riderId')
  getWallet(@Param('riderId') riderId: string) {
    return this.walletService.getWallet(riderId);
  }

  @Get('history/:riderId')
  getHistory(@Param('riderId') riderId: string) {
    return this.walletService.getHistory(riderId);
  }
}