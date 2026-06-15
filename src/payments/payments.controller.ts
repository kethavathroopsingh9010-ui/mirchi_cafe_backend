import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  Get,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':orderId')
  create(@Param('orderId') orderId: string, @Body() body: CreatePaymentDto) {
    return this.paymentsService.createPayment(orderId, body.method);
  }

  @Patch('success/:paymentId')
  success(
    @Param('paymentId') paymentId: string,
    @Body() body: { transactionId: string },
  ) {
    return this.paymentsService.markSuccess(paymentId, body.transactionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  
}