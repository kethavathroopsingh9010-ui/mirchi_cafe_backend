import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Coupon } from './entities/coupon.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
  ) {}

  create(dto: any) {
    const coupon = this.couponRepo.create(dto);
    return this.couponRepo.save(coupon);
  }

  findAll() {
    return this.couponRepo.find();
  }

  async validateCoupon(code: string, orderAmount: number) {
    const coupon = await this.couponRepo.findOne({
      where: { code },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is inactive');
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      throw new BadRequestException('Coupon expired');
    }

    if (coupon.usedCount >= coupon.usageLimit && coupon.usageLimit !== 0) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    //  CALCULATE DISCOUNT
    const discountAmount = (orderAmount * coupon.discount) / 100;
    const finalAmount = orderAmount - discountAmount;

    return {
      originalAmount: orderAmount,
      discount: discountAmount,
      finalAmount,
    };
  }

  async applyCoupon(code: string) {
    const coupon = await this.couponRepo.findOne({
      where: { code },
    });

    if (!coupon) throw new NotFoundException('Coupon not found');

    coupon.usedCount += 1;
    return this.couponRepo.save(coupon);
  }
}