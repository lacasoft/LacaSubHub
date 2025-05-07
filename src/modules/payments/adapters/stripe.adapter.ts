/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Repository } from 'typeorm';

import { PaymentProvider } from 'src/common/enums/payment-provider.enum';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { PaymentException } from 'src/common/exceptions/payment.exception';
import { StripeHttpService } from 'src/common/http/stripe-http.service';

import { PaymentEntity } from '../entities/payment.entity';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { CapturePaymentDto } from '../dtos/capture-payment.dto';
import { RefundPaymentDto } from '../dtos/refund-payment.dto';
import { Payment } from '../interfaces/paypal.interface';
import { PaymentAdapter } from './payment-adapter.interface';

@Injectable()
export class StripeAdapter implements PaymentAdapter {
  constructor(
    private stripeHttp: StripeHttpService,
    @InjectRepository(PaymentEntity)
    private repo: Repository<PaymentEntity>,
  ) {}

  async create(
    dto: CreatePaymentDto,
  ): Promise<Payment & { paymentUrl: string }> {
    const id = uuid();

    const entity = this.repo.create({
      id,
      provider: PaymentProvider.STRIPE,
      amount: dto.amount,
      currency: dto.currency.toUpperCase(),
      status: PaymentStatus.CREATED,
    });

    const price = await this.stripeHttp.stripe.prices.create({
      currency: dto.currency.toLowerCase(),
      product_data: { name: dto.metadata?.planType ?? 'Pago' },
      unit_amount: Math.round(dto.amount * 100),
    });

    const link = await this.stripeHttp.stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: {
        paymentId: id,
        userId: dto.metadata?.userId ?? 'unknown',
        planType: dto.metadata?.planType ?? 'UNDEFINED',
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: dto.metadata?.returnUrl ?? 'https://example.com/thanks',
        },
      },
    });

    entity.providerOrderId = link.id;
    entity.metadata = { url: link.url, paymentLink: link.id };
    await this.repo.save(entity);

    return { ...entity, paymentUrl: link.url };
  }

  async capture(dto: CapturePaymentDto): Promise<Payment> {
    const payment = await this.repo.findOneBy({
      providerOrderId: dto.orderId,
    });
    if (!payment) {
      throw new PaymentException('Payment not found', HttpStatus.NOT_FOUND);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      payment.status = PaymentStatus.COMPLETED;
      await this.repo.save(payment);
    }

    return payment;
  }

  async refund(dto: RefundPaymentDto): Promise<Payment> {
    const payment = await this.repo.findOneBy({ id: dto.paymentId });
    if (!payment) {
      throw new PaymentException('Payment not found', HttpStatus.NOT_FOUND);
    }

    const intentId = payment.metadata?.checkout_session?.payment_intent;
    await this.stripeHttp.stripe.refunds.create({
      payment_intent: intentId,
      amount: Math.round(dto.amount * 100),
    });

    payment.status = PaymentStatus.REFUNDED;
    await this.repo.save(payment);
    return payment;
  }
}
