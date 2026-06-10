import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
} from '@nestjs/common';

import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post(':userId')
  addToCart(
    @Param('userId') userId: string,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addToCart(userId, dto);
  }

  @Get(':userId')
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }
}