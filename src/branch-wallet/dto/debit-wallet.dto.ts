import { IsNumber, IsPositive } from 'class-validator';

export class DebitWalletDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Withdrawal amount must be greater than 0' })
  amount!: number;
}