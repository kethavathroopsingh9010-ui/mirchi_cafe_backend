import { IsString, IsEnum, IsUUID,IsNotEmpty } from 'class-validator';


export enum PaymentMethod {
  COD = 'cod',
  CARD = 'card',
}

export class CreateOrderDto {
  @IsString()
  address!: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsUUID()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  branchId!: string;
}