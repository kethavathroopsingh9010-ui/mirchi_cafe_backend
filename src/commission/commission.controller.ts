import {
  Controller,
  Post,
  Get,
  Body,
} from '@nestjs/common';

import { CommissionService } from './commission.service';

@Controller('commission')
export class CommissionController {
  constructor(
    private readonly commissionService: CommissionService,
  ) {}

  // 🔥 calculate commission from amount
  @Post('calculate')
  calculate(@Body('amount') amount: number) {
    return this.commissionService.calculate(amount);
  }

  // 🔥 get all commissions
  @Get()
  findAll() {
    return this.commissionService.findAll();
  }
}