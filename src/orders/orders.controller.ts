import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './order-status.enum';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService
  ) {}

  // PLACES A NEW MULTINATIONAL ORDER
  @Post()
  create(
    @Body() dto: CreateOrderDto
  ) {
    // This cleanly passes the payload containing branchId, userId, etc. to the service layer
    return this.ordersService.createOrder(dto);
  }

  // FETCH SINGLE ORDER (INCLUDES COUNTRY & BRANCH DETAILS VIA RELATION)
  @Get('single/:orderId')
  getOrder(
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.findOne(orderId);
  }

  // FETCH ALL HISTORICAL ORDERS FOR A SPECIFIC USER
  @Get('user/:userId')
  getUserOrders(
    @Param('userId') userId: string,
  ) {
    return this.ordersService.findUserOrders(userId);
  }

  // STATE MACHINE SWITCH: UPDATE STATUS WORKFLOW (TRIGGERING REGIONAL SPLITS UPON DELIVERY)
  @Patch(':orderId/status')
  updateStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(
      orderId,
      status
    );
  }

  // ASSIGN DELIVERY DISPATCH MANAGEMENT
  @Post(':orderId/assign-rider/:riderId')
  assignRider(
    @Param('orderId') orderId: string,
    @Param('riderId') riderId: string,
  ) {
    return this.ordersService.assignRider(
      orderId,
      riderId
    );
  }
}