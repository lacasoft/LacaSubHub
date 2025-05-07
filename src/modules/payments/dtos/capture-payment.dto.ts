import { IsEnum, IsString } from 'class-validator';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';

export class CapturePaymentDto {
  @IsString()
  orderId: string;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;
}
