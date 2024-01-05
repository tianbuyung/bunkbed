import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { ClientProxy } from '@nestjs/microservices';

import { NOTIFICATIONS_SERVICE } from '@app/common';
import { PaymentsCreateChargeDto } from './dto/payments-create-charge.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(
    this.configService.get('STRIPE_SECRET_KEY'),
    {
      apiVersion: '2023-10-16',
    },
  );

  constructor(
    private readonly configService: ConfigService,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
  ) {}

  async createCharge({ amount, email }: PaymentsCreateChargeDto) {
    // const paymentMethod = await this.stripe.paymentMethods.create({
    //   type: 'card',
    //   card,
    // });

    const paymentIntent = await this.stripe.paymentIntents.create({
      // payment_method: paymentMethod.id,
      payment_method: 'pm_card_visa', // change this follow new stripe api requirement
      amount: Math.round(amount * 100),
      confirm: true,
      // payment_method_types: ['card'],
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    this.notificationsService.emit('notify_email', { email });

    return paymentIntent;
  }
}
