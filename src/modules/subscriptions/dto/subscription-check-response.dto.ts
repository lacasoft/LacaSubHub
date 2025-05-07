import { Exclude, Expose } from 'class-transformer';
import { FormatDate } from 'src/common/utils/helpers/date.helper';

@Exclude()
export class SubscriptionCheckResponseDto {
  @Expose()
  hasActiveSubscription: boolean;

  @Expose()
  @FormatDate()
  endDate?: Date;

  @Expose()
  requirePayment: boolean;

  @Expose()
  message: string;
}
