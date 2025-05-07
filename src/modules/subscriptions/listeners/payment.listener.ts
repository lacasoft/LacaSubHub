import { OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { PaymentCompletedEvent } from 'src/common/events/payment-completed.event';
import { UserSubscriptionService } from 'src/modules/user-subscription/services/user-subscription.service';

@Injectable()
export class PaymentListener {
  private readonly logger = new Logger(PaymentListener.name);

  constructor(
    private readonly userSubscriptionService: UserSubscriptionService,
  ) {}

  @OnEvent('payment.completed')
  async handlePaymentCompleted(event: PaymentCompletedEvent) {
    try {
      this.logger.log(`Datos del evento: ${JSON.stringify(event)}`);

      const result = await this.userSubscriptionService.activatePremium(
        event.userId,
        {
          provider: event.provider,
          providerId: event.providerOrderId,
          amount: event.amount,
          planType: event.planType,
        },
      );

      this.logger.log(`Suscripción actualizada: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(
        `Error en activatePremium: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
