import { IsNumber, IsPositive } from 'class-validator';

export class DebitBranchWalletDto {
  @IsNumber()
  @IsPositive()
  amount!: number;
}