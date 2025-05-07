import { Exclude, Expose } from 'class-transformer';
import { FormatDate } from 'src/common/utils/helpers/date.helper';

@Exclude()
export class UserResponseDto {
  @Expose()
  whatsappId: string;

  @Expose()
  @FormatDate()
  trialEndDate: Date | null;
}
