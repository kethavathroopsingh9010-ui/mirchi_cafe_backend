import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { DeliveryStatus } from '../entities/delivery.entity';

export class UpdateDeliveryDto {
  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;

  @IsOptional()
  @IsDateString()
  pickupTime?: Date;

  @IsOptional()
  @IsDateString()
  deliveredTime?: Date;
}