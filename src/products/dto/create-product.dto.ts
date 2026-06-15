import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name!: string;

  @Type(() => Number)
  @IsNumber()
  price!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}