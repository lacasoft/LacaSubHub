import {
  IsEnum,
  IsString,
  IsNumber,
  IsDate,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';
import { SubscriptionPlanType } from 'src/common/enums/subscription-plan-type.enum';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';

export class CreateSubscriptionDto {
  @IsUUID()
  userId: string;

  @IsEnum(SubscriptionPlanType)
  planType: SubscriptionPlanType;

  @IsString()
  planName: string;

  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  discountPercentage?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  discountEndDate?: Date;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @IsEnum(PaymentProvider)
  @IsOptional()
  paymentProvider?: PaymentProvider;

  @IsString()
  @IsOptional()
  paymentProviderId?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastPaymentDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  nextBillingDate?: Date;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
