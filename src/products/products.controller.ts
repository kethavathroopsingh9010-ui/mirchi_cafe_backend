import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  // CREATE PRODUCT
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // GET ALL PRODUCTS
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // GET PRODUCT BY ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}