import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriptionDto } from './create-subscription.dto';
import { IsEnum, IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  canceledAt?: Date;

  @IsString()
  @IsOptional()
  cancelReason?: string;
}
