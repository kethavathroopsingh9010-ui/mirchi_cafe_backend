import { IsEnum } from 'class-validator';

export enum RiderStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export class UpdateRiderStatusDto {
  @IsEnum(RiderStatus)
  status!: RiderStatus;
}