/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';

import { PaymentsService } from '../services/payments.service';
import { PaypalHttpService } from 'src/common/http/paypal-http.service';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';
import { SubscriptionPlanType } from 'src/common/enums/subscription-plan-type.enum';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('webhooks')
export class PaypalWebhookController {
  private readonly logger = new Logger(PaypalWebhookController.name);

  constructor(
    private readonly paypalHttp: PaypalHttpService,
    private readonly payments: PaymentsService,
  ) {}

  @Post('paypal')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: Request) {
    const body = req.body;

    const transmissionId = req.headers['paypal-transmission-id'] as string;
    const time = req.headers['paypal-transmission-time'] as string;
    const certUrl = req.headers['paypal-cert-url'] as string;
    const authAlgo = req.headers['paypal-auth-algo'] as string;
    const signature = req.headers['paypal-transmission-sig'] as string;
    const webhookId = process.env.PAYPAL_WEBHOOK_ID!;

    const verification = await this.paypalHttp.post<any>(
      '/v1/notifications/verify-webhook-signature',
      {
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: signature,
        transmission_time: time,
        webhook_id: webhookId,
        webhook_event: body,
      },
    );
    if (verification.verification_status !== 'SUCCESS') {
      this.logger.error('Invalid PayPal webhook signature', verification);
      throw new BadRequestException('Invalid signature');
    }

    const eventType = body.event_type as string;
    if (eventType === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = body.resource.id as string;
      const custom = JSON.parse(
        (body.resource.purchase_units[0].custom_id as string) || '{}',
      );
      const userId =
        typeof custom.userId === 'string' ? custom.userId : undefined;
      const planType =
        (custom.planType as SubscriptionPlanType) || SubscriptionPlanType.BASIC;

      await this.payments.capture(
        { orderId, provider: PaymentProvider.PAYPAL },
        userId,
        planType,
      );
    }

    return { received: true };
  }
}
