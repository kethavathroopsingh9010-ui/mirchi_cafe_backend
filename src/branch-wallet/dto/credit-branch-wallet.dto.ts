import { IsNumber, IsPositive } from 'class-validator';

export class CreditBranchWalletDto {
  @IsNumber()
  @IsPositive()
  amount!: number;
}