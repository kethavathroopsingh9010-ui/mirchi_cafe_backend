import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { CouponType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @IsString()
  code!: string;

  @IsEnum(CouponType)
  type!: CouponType;

  @IsNumber()
  discount!: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;
}