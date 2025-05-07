import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';
import { UserEntity } from '../entities/user.entity';
import { ISubscription } from 'src/common/interfaces/suscription.interface';
import { IUserWithSubscription } from 'src/common/interfaces/user.interface';
import { SubscriptionEntity } from 'src/modules/subscriptions/entities/subscription.entity';

export class UserMapper {
  static toUserWithSubscription(
    user: UserEntity,
    subscription?: SubscriptionEntity,
  ): IUserWithSubscription {
    return {
      id: user.id,
      whatsappId: user.whatsappId,
      trialEndDate: user.trialEndDate ?? undefined,
      subscription: subscription
        ? this.toSubscription(subscription)
        : undefined,
    };
  }

  private static toSubscription(sub: SubscriptionEntity): ISubscription {
    return {
      id: sub.id,
      planType: sub.planType,
      planName: sub.planName,
      status: sub.status,
      price: sub.price,
      startDate: sub.startDate,
      endDate: sub.endDate,
      trialEndDate:
        sub.status === SubscriptionStatus.TRIAL ? sub.endDate : undefined,
      autoRenew: sub.autoRenew,
    };
  }
}
