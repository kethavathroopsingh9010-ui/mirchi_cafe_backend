import { IsString, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  address!: string; 

  @IsString()
  @IsNotEmpty()
  countryCode!: string; 

  @IsString()
  @IsNotEmpty()
  currency!: string; 
  @IsNumber()
  @IsNotEmpty()
  taxPercentage!: number; 

  @IsArray()
  @IsString({ each: true })
  supportedPaymentGateways!: string[]; 
}