import { IsEnum, IsUUID, IsNumber, Min } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsUUID()
  orderId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;
}