import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @Post('validate/:code')
  @HttpCode(HttpStatus.OK)
  validate(
    @Param('code') code: string,
    @Body('orderAmount') orderAmount: number,
  ) {
    return this.couponsService.validateCoupon(code, orderAmount);
  }

  @Post('apply/:code')
  @HttpCode(HttpStatus.OK)
  apply(@Param('code') code: string) {
    return this.couponsService.applyCoupon(code);
  }
}