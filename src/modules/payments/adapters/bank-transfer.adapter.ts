import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentAdapter } from './payment-adapter.interface';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { PaymentException } from 'src/common/exceptions/payment.exception';
import { CapturePaymentDto } from '../dtos/capture-payment.dto';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { RefundPaymentDto } from '../dtos/refund-payment.dto';
import { PaymentEntity } from '../entities/payment.entity';
import { Payment } from '../interfaces/paypal.interface';

@Injectable()
export class BankTransferAdapter implements PaymentAdapter {
  constructor(
    @InjectRepository(PaymentEntity) private repo: Repository<PaymentEntity>,
  ) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const reference = process.env.BANK_ACCOUNT_NUMBER ?? 'SIN-REF';
    const entity = this.repo.create({
      provider: PaymentProvider.BANK_TRANSFER,
      providerOrderId: `BT-${Date.now()}`,
      amount: dto.amount,
      currency: dto.currency.toUpperCase(),
      status: PaymentStatus.PENDING,
      metadata: { reference },
    });
    await this.repo.save(entity);
    return entity;
  }

  async capture(dto: CapturePaymentDto): Promise<Payment> {
    const payment = await this.repo.findOneBy({ providerOrderId: dto.orderId });
    if (!payment)
      throw new PaymentException('Payment not found', HttpStatus.NOT_FOUND);

    payment.status = PaymentStatus.COMPLETED;
    await this.repo.save(payment);
    return payment;
  }

  async refund(dto: RefundPaymentDto): Promise<Payment> {
    const payment = await this.repo.findOneBy({ id: dto.paymentId });
    if (!payment)
      throw new PaymentException('Payment not found', HttpStatus.NOT_FOUND);

    payment.status = PaymentStatus.REFUNDED;
    payment.metadata = { ...payment.metadata, refundReason: dto.reason };
    await this.repo.save(payment);
    return payment;
  }
}
