import { CapturePaymentDto } from '../dtos/capture-payment.dto';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { RefundPaymentDto } from '../dtos/refund-payment.dto';
import { Payment } from '../interfaces/paypal.interface';

export interface PaymentAdapter {
  create(dto: CreatePaymentDto): Promise<Payment>;
  capture(dto: CapturePaymentDto): Promise<Payment>;
  refund(dto: RefundPaymentDto): Promise<Payment>;
}
