import { PaymentProvider } from '../enums/payment-provider.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { SubscriptionPlanType } from '../enums/subscription-plan-type.enum';

export class PaymentCompletedEvent {
  constructor(
    public readonly userId: string,
    public readonly paymentId: string,
    public readonly provider: PaymentProvider,
    public readonly providerOrderId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly planType: SubscriptionPlanType,
    public readonly status: PaymentStatus = PaymentStatus.COMPLETED,
  ) {
    if (!userId || !providerOrderId) {
      throw new Error('Datos inválidos para PaymentCompletedEvent');
    }
  }
}
