import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentAdapter } from '../adapters/payment-adapter.interface';
import { PaypalAdapter } from '../adapters/paypal.adapter';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { PaymentCompletedEvent } from 'src/common/events/payment-completed.event';
import { PaymentException } from 'src/common/exceptions/payment.exception';

import { CapturePaymentDto } from '../dtos/capture-payment.dto';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { RefundPaymentDto } from '../dtos/refund-payment.dto';
import { Payment } from '../interfaces/paypal.interface';
import { StripeAdapter } from '../adapters/stripe.adapter';
import { BankTransferAdapter } from '../adapters/bank-transfer.adapter';
import { SubscriptionPlanType } from 'src/common/enums/subscription-plan-type.enum';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly adapterMap: Partial<Record<PaymentProvider, PaymentAdapter>>;

  constructor(
    private readonly paypalAdapter: PaypalAdapter,
    private readonly stripeAdapter: StripeAdapter,
    private readonly bankAdapter: BankTransferAdapter,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.adapterMap = {
      [PaymentProvider.PAYPAL]: this.paypalAdapter,
      [PaymentProvider.STRIPE]: this.stripeAdapter,
      [PaymentProvider.BANK_TRANSFER]: this.bankAdapter,
    };
  }

  private getAdapter(provider: PaymentProvider): PaymentAdapter {
    const adapter = this.adapterMap[provider];
    if (!adapter) {
      throw new PaymentException(
        'Provider not supported',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
    return adapter;
  }

  create(dto: CreatePaymentDto): Promise<Payment> {
    return this.getAdapter(dto.provider).create(dto);
  }

  refund(dto: RefundPaymentDto): Promise<Payment> {
    const adapter = this.getAdapter(PaymentProvider.BANK_TRANSFER);
    return adapter.refund(dto);
  }

  async capture(
    dto: CapturePaymentDto,
    userId?: string,
    planType?: SubscriptionPlanType,
  ) {
    const adapter = this.getAdapter(dto.provider);
    const payment = await adapter.capture(dto);

    if (payment.status === PaymentStatus.COMPLETED) {
      this.eventEmitter.emit(
        'payment.completed',
        new PaymentCompletedEvent(
          userId ?? 'unknown-user',
          payment.id,
          payment.provider,
          payment.providerOrderId,
          payment.amount,
          payment.currency,
          planType ?? SubscriptionPlanType.BASIC,
        ),
      );
      this.logger.log(`Payment ${payment.id} captured and event emitted`);
    }
    return payment;
  }
}
