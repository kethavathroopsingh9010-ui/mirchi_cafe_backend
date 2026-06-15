import { IsNumber, IsPositive } from 'class-validator';

export class CreditWalletDto {
  @IsNumber()
  @IsPositive()
  amount!: number;
}