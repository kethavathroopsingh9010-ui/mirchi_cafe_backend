import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code!: string;

  @IsNumber()
  discount!: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;
}