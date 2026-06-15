import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateDeliveryDto {
  @IsUUID()
  orderId!: string;

  @IsUUID()
  riderId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}