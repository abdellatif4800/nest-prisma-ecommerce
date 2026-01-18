import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { log } from 'node:console';
import Stripe from 'stripe';
import type { UserAuthPayload } from 'apiLibs/common';
import { OrderManagementService } from 'apiLibs/order-management';

@Injectable()
export class PaymentManagementService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentManagementService.name);

  constructor(
    @Inject('STRIPE_API_KEY')
    private readonly apiKey: string,
    @Inject(forwardRef(() => OrderManagementService))
    private orderService: OrderManagementService,
  ) {
    this.stripe = new Stripe(this.apiKey);
  }

  async webhook(rawBody: Buffer, sig: string) {
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const status = paymentIntent.status;
    await this.orderService.restockAndClearCart(
      paymentIntent.metadata.userId,
      paymentIntent.metadata.orderId,
    );

    console.log('Event type:', paymentIntent.metadata);
    console.log('PaymentIntent status:', status);
    // log('event', event.data.object);
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    userId: string,
    cartId: string,
    orderId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata: {
          userId: userId,
          cartId: cartId,
          orderId: orderId,
        },
      });

      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to create PaymentIntent', error.stack);
      throw error;
    }
  }

  async createPaymentLink(priceId: string): Promise<Stripe.PaymentLink> {
    try {
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [{ price: priceId, quantity: 1 }],
      });
      this.logger.log('Payment link created successfully');
      return paymentLink;
    } catch (error) {
      this.logger.error('Failed to create payment link', error.stack);
      throw error;
    }
  }
}
