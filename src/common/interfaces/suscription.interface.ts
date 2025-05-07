import { SubscriptionPlanType } from '../enums/subscription-plan-type.enum';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

export interface ISubscription {
  id: string;
  planType: SubscriptionPlanType;
  planName: string;
  status: SubscriptionStatus;
  price: number;
  startDate: Date;
  endDate: Date;
  trialEndDate?: Date;
  autoRenew: boolean;
}
