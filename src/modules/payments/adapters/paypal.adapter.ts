/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { PaymentException } from 'src/common/exceptions/payment.exception';
import { PaypalHttpService } from 'src/common/http/paypal-http.service';
import { Repository } from 'typeorm';
import { CapturePaymentDto } from '../dtos/capture-payment.dto';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { RefundPaymentDto } from '../dtos/refund-payment.dto';
import { PaymentEntity } from '../entities/payment.entity';
import { Payment } from '../interfaces/paypal.interface';
import { PaymentAdapter } from './payment-adapter.interface';

export interface PaymentWithUrl extends Payment {
  paymentUrl: string;
}

@Injectable()
export class PaypalAdapter implements PaymentAdapter {
  constructor(
    private paypal: PaypalHttpService,
    @InjectRepository(PaymentEntity) private repo: Repository<PaymentEntity>,
  ) {}

  async create(dto: CreatePaymentDto): Promise<PaymentWithUrl> {
    const body = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: dto.currency.toUpperCase(),
            value: dto.amount.toFixed(2),
          },
          custom_id: JSON.stringify({
            userId: dto.metadata?.userId,
            planType: dto.metadata?.planType,
          }),
        },
      ],
      application_context: {
        return_url: dto.metadata?.returnUrl ?? 'https://example.com/thanks',
        cancel_url: dto.metadata?.cancelUrl ?? 'https://example.com/cancel',
        user_action: 'PAY_NOW',
      },
    };

    const order = await this.paypal.post<any>('/v2/checkout/orders', body);
    const approvalUrl =
      order.links.find((l: any) => l.rel === 'approve')?.href ?? '';

    const entity = this.repo.create({
      provider: PaymentProvider.PAYPAL,
      providerOrderId: order.id,
      amount: dto.amount,
      currency: dto.currency.toUpperCase(),
      status: PaymentStatus.CREATED,
      metadata: { approvalUrl },
    });
    await this.repo.save(entity);

    return { ...entity, paymentUrl: approvalUrl };
  }

  async capture(dto: CapturePaymentDto): Promise<Payment> {
    const payment = await this.repo.findOneBy({ providerOrderId: dto.orderId });
    if (!payment)
      throw new PaymentException('Payment not found', HttpStatus.NOT_FOUND);

    const res = await this.paypal.post<any>(
      `/v2/checkout/orders/${dto.orderId}/capture`,
      {},
    );
    payment.status =
      res.status === 'COMPLETED'
        ? PaymentStatus.COMPLETED
        : PaymentStatus.PENDING;
    payment.metadata = { ...payment.metadata, capture: res };
    await this.repo.save(payment);
    return payment;
  }

  async refund(dto: RefundPaymentDto): Promise<Payment> {
    const payment = await this.repo.findOneBy({ id: dto.paymentId });
    if (!payment)
      throw new PaymentException('Payment not found', HttpStatus.NOT_FOUND);

    const captureId =
      payment.metadata?.capture?.purchase_units?.[0]?.payments?.captures?.[0]
        ?.id;
    if (!captureId)
      throw new PaymentException('No capture found', HttpStatus.BAD_REQUEST);

    await this.paypal.post(`/v2/payments/captures/${captureId}/refund`, {
      amount: { value: dto.amount.toFixed(2), currency_code: payment.currency },
    });

    payment.status = PaymentStatus.REFUNDED;
    await this.repo.save(payment);
    return payment;
  }
}
