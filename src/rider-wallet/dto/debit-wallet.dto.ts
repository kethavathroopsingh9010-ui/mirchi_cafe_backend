import { IsNumber, IsPositive } from 'class-validator';

export class DebitWalletDto {
  @IsNumber()
  @IsPositive()
  amount!: number;
}