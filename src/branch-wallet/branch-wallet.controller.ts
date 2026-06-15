import {
  Controller,
  Post,
  Get,
  Param,
  Body,
} from '@nestjs/common';

import { BranchWalletService } from './branch-wallet.service';

import { CreditBranchWalletDto } from './dto/credit-branch-wallet.dto';
import { DebitBranchWalletDto } from './dto/debit-branch-wallet.dto'; // ✨ Kept the correct branch-specific DTO

@Controller('branch-wallet')
export class BranchWalletController {
  constructor(
    private readonly walletService: BranchWalletService,
  ) {}

  @Post('create/:branchId')
  createWallet(
    @Param('branchId') branchId: string,
  ) {
    return this.walletService.createWallet(branchId);
  }

  @Post('credit/:branchId')
  creditWallet(
    @Param('branchId') branchId: string,
    @Body() dto: CreditBranchWalletDto,
  ) {
    return this.walletService.credit(branchId, dto.amount);
  }

  // ✨ Unified into a single, clean debit route using DebitBranchWalletDto
  @Post('debit/:branchId')
  debitWallet(
    @Param('branchId') branchId: string,
    @Body() dto: DebitBranchWalletDto,
  ) {
    return this.walletService.debit(branchId, dto.amount);
  }

  @Get(':branchId')
  getWallet(
    @Param('branchId') branchId: string,
  ) {
    return this.walletService.getWallet(branchId);
  }

  @Get('history/:branchId')
  getHistory(
    @Param('branchId') branchId: string,
  ) {
    return this.walletService.getHistory(branchId);
  }
}