import { Injectable } from '@nestjs/common';
import { UserSubscriptionService } from 'src/modules/user-subscription/services/user-subscription.service';
import { SubscriptionCheckResponseDto } from '../dto/subscription-check-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly userSubscriptionService: UserSubscriptionService,
  ) {}

  async checkSubscriptionStatus(
    whatsappId: string,
  ): Promise<SubscriptionCheckResponseDto> {
    const result =
      await this.userSubscriptionService.checkSubscriptionStatus(whatsappId);
    return plainToInstance(SubscriptionCheckResponseDto, result);
  }
}
