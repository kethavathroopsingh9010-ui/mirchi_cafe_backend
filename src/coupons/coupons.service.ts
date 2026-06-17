import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Coupon, CouponType } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
  ) {}

  async create(dto: CreateCouponDto) {
    const cleanCode = dto.code.trim().toUpperCase();
    
    const existing = await this.couponRepo.findOne({ where: { code: cleanCode } });
    if (existing) {
      throw new BadRequestException(`Coupon code '${cleanCode}' already exists.`);
    }

    const coupon = this.couponRepo.create({
      ...dto,
      code: cleanCode,
    });
    return this.couponRepo.save(coupon);
  }

  findAll() {
    return this.couponRepo.find({ order: { createdAt: 'DESC' } });
  }

  async validateCoupon(code: string, orderAmount: number) {
    const coupon = await this.couponRepo.findOne({
      where: { code: code.trim().toUpperCase() },
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

    if (coupon.usageLimit !== 0 && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    // 🌟 CALCULATE DYNAMIC DEDUCTIONS: Accounts for both flat money deductions and sliding percentages
    let discountAmount = 0;

    if (coupon.type === CouponType.PERCENTAGE) {
      discountAmount = (orderAmount * coupon.discount) / 100;
    } else if (coupon.type === CouponType.FIXED) {
      discountAmount = coupon.discount;
    }

    // Safety check to ensure the coupon cannot discount past the order total
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    const finalAmount = orderAmount - discountAmount;

    return {
      valid: true,
      originalAmount: orderAmount,
      discount: parseFloat(discountAmount.toFixed(2)),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
    };
  }

  async applyCoupon(code: string) {
    const coupon = await this.couponRepo.findOne({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) throw new NotFoundException('Coupon not found');

    if (coupon.usageLimit !== 0 && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    coupon.usedCount += 1;
    return await this.couponRepo.save(coupon);
  }
}