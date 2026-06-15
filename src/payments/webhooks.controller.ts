import { Controller, Post, Req, Headers, BadRequestException, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import * as crypto from 'crypto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 💳 STRIPE WEBHOOK ENDPOINT
  @Post('stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @Req() req: any, // Changed to 'any' to bypass strict Express type-mismatches in workspace
    @Headers('stripe-signature') signature: string,
  ) {
    const StripeConstructor = require('stripe');
    const stripe = new StripeConstructor(process.env.STRIPE_SECRET_KEY || '');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !endpointSecret) {
      throw new BadRequestException('Missing Stripe signature or secret');
    }

    let event: any; // Changed to 'any' to eliminate rigid Stripe SDK type definition blocks

    try {
      const rawBody = req.rawBody; // Leverages the buffer from main.ts configuration
      event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook Signature Verification Failed: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object; 
      const orderId = paymentIntent.metadata?.orderId;
      
      if (!orderId) {
        throw new BadRequestException('No orderId linked to payment intent metadata');
      }

      const payment = await this.paymentsService.findOneByOrderId(orderId);
      if (payment) {
        await this.paymentsService.markSuccess(payment.id, paymentIntent.id);
      }
    }

    return { received: true };
  }

  // 🍊 RAZORPAY WEBHOOK ENDPOINT
  @Post('razorpay')
  @HttpCode(200)
  async handleRazorpayWebhook(
    @Req() req: any, // Changed to 'any' for consistent local compiler compilation
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_secret';
    const rawBody = req.rawBody;

    if (!signature) {
      throw new BadRequestException('Missing Razorpay signature');
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid Razorpay Webhook Signature');
    }

    const event = req.body;

    if (event.event === 'payment.captured') {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      const transactionId = event.payload.payment.entity.id;

      const payment = await this.paymentsService.findOneByGatewayOrderId(razorpayOrderId);
      if (payment) {
        await this.paymentsService.markSuccess(payment.id, transactionId);
      }
    }

    return { status: 'ok' };
  }
}