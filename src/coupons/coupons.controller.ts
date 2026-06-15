import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  create(@Body() dto: any) {
    return this.couponsService.create(dto);
  }

  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @Post('validate/:code')
  validate(
    @Param('code') code: string,
    @Body('orderAmount') orderAmount: number,
  ) {
    return this.couponsService.validateCoupon(code, orderAmount);
  }

  @Post('apply/:code')
  apply(@Param('code') code: string) {
    return this.couponsService.applyCoupon(code);
  }
}