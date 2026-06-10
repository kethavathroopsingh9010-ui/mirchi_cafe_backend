import { IsUUID, IsNumber } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  productId!: string;

  @IsNumber()
  quantity!: number;
}