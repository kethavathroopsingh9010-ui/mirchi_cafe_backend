import { IsString, IsPhoneNumber, IsOptional } from 'class-validator';

export class CreateRiderDto {
  @IsString()
  name!: string;

  @IsPhoneNumber('IN')
  phone!: string;

  @IsOptional()
  @IsString()
  vehicleNumber?: string;

  @IsOptional()
  @IsString()
  city?: string;
}