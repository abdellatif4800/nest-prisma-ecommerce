import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentManagementService } from './payment-management.service';
import { AuthGuard, CurrentUser, type UserAuthPayload } from 'apiLibs/common';
import { log } from 'console';
import { raw, type Request } from 'express';
import type { RawBodyRequest } from '@nestjs/common';

@Controller('payment')
export class PaymentManagementUserController {
  constructor(private paymentService: PaymentManagementService) { }

  // @Post('create-payment-intent')
  // @UseGuards(AuthGuard)
  // createPaymentIntent(
  //   @CurrentUser() user: UserAuthPayload,
  //   @Body() body: { amount: number; currency: string },
  // ) {
  //   const { amount, currency } = body;
  //   return this.paymentService.createPaymentIntent(amount, currency, user);
  // }

  @Post('payment-links')
  @UseGuards(AuthGuard)
  createPaymentLink(@Body() body: { priceId: string }) {
    return this.paymentService.createPaymentLink(body.priceId);
  }

  @Post('webhook')
  stripeWebhook(@Req() req: RawBodyRequest<Request>) {
    const rawBody: any = req.rawBody;
    const sig = req.headers['stripe-signature'] as string;

    this.paymentService.webhook(rawBody, sig);
  }
}
