import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';

import { PaymentsService } from '../services/payments.service';
import { StripeHttpService } from 'src/common/http/stripe-http.service';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';
import { Public } from 'src/common/decorators/public.decorator';
import { SubscriptionPlanType } from 'src/common/enums/subscription-plan-type.enum';

@Controller('webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private stripeHttp: StripeHttpService,
    private payments: PaymentsService,
  ) {}

  @Post('stripe')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleStripe(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripeHttp.stripe.webhooks.constructEvent(
        req.body as Buffer,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      this.logger.error('Invalid Stripe signature', err);
      throw new BadRequestException('Invalid signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const plink = session.payment_link;
      if (!plink) {
        this.logger.warn('No payment_link en session, ignoro');
      } else {
        await this.payments.capture(
          { orderId: plink as string, provider: PaymentProvider.STRIPE },
          session.metadata?.userId ?? '',
          session.metadata?.planType as SubscriptionPlanType,
        );
      }
    }

    return { received: true };
  }
}
