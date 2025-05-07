import { Exclude, Expose } from 'class-transformer';
import { FormatDate } from 'src/common/utils/helpers/date.helper';

@Exclude()
export class SubscriptionResponseDto {
  @Expose()
  planType: string;

  @Expose()
  planName: string;

  @Expose()
  price: number;

  @Expose()
  @FormatDate()
  endDate: Date;
}
