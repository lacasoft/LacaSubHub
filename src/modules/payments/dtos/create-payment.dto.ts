import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';

export class CreatePaymentDto {
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsNumber()
  @Min(0.5)
  amount: number;

  @IsString()
  @Length(3, 3)
  currency: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
