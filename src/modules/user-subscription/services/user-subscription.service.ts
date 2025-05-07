import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/modules/users/repositories/user.repostory';
import { SubscriptionRepository } from 'src/modules/subscriptions/repositories/subscriptions.repository';
import { MessagesService } from 'src/common/utils/messages/messages.service';
import { EntityManager } from 'typeorm';
import { SubscriptionEntity } from 'src/modules/subscriptions/entities/subscription.entity';
import { CreateSubscriptionDto } from 'src/modules/subscriptions/dto/create-subscription.dto';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';
import { SubscriptionPlanType } from 'src/common/enums/subscription-plan-type.enum';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';
import { SubscriptionCheckResponseDto } from 'src/modules/subscriptions/dto/subscription-check-response.dto';

@Injectable()
export class UserSubscriptionService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly messagesService: MessagesService,
  ) {}

  async checkSubscriptionStatus(
    whatsappId: string,
  ): Promise<SubscriptionCheckResponseDto> {
    const result = await this.getUserWithSubscription(whatsappId);

    if (!result?.user) {
      throw new NotFoundException(
        this.messagesService.getError('USER', 'NOT_FOUND'),
      );
    }

    const now = new Date();
    const hasActiveSubscription =
      result.activeSubscription?.endDate &&
      result.activeSubscription.endDate > now;

    const endDate = result.activeSubscription?.endDate;
    const isTrialActive = endDate && endDate > now;

    let message = '';
    if (hasActiveSubscription) {
      message = this.messagesService.getUI('SUBSCRIPTION_STATUS', 'ACTIVE');
    } else if (isTrialActive) {
      message = `${this.messagesService.getUI('SUBSCRIPTION_STATUS', 'TRIAL_ACTIVE')} ${endDate.toLocaleDateString()}`;
    } else {
      message = this.messagesService.getUI('SUBSCRIPTION_STATUS', 'INACTIVE');
    }

    return {
      hasActiveSubscription: hasActiveSubscription || !!isTrialActive,
      endDate: endDate ?? undefined,
      requirePayment: !hasActiveSubscription && !isTrialActive,
      message,
    };
  }

  async createTrialSubscriptionWithTransaction(
    userId: string,
    transactionManager: EntityManager,
  ): Promise<SubscriptionEntity> {
    const trialDays = Math.max(1, Number(process.env.APP_TRIAL_DAYS) || 7);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + trialDays);

    const subscription = transactionManager.create(SubscriptionEntity, {
      userId,
      planType: SubscriptionPlanType.TRIAL,
      planName: `${trialDays} Días Gratis`,
      status: SubscriptionStatus.ACTIVE,
      price: 0,
      startDate,
      endDate,
      autoRenew: false,
    });

    return transactionManager.save(subscription);
  }

  async activatePremium(
    userId: string,
    paymentData: {
      provider: string;
      providerId: string;
      amount: number;
      planType: SubscriptionPlanType;
    },
  ): Promise<{
    user: UserEntity;
    subscription: SubscriptionEntity;
  }> {
    return this.userRepository.runInTransaction(async (manager) => {
      const existingSubscription =
        await this.subscriptionRepository.findActiveSubscription(userId);

      let startDate = new Date();
      if (existingSubscription && existingSubscription.endDate > startDate) {
        startDate = new Date(existingSubscription.endDate);
      }

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const subscriptionDto: CreateSubscriptionDto = {
        userId,
        planType: paymentData.planType,
        planName: `Plan ${paymentData.planType}`,
        status: SubscriptionStatus.ACTIVE,
        price: paymentData.amount,
        startDate,
        endDate,
        autoRenew: true,
        paymentProvider: paymentData.provider as PaymentProvider,
        paymentProviderId: paymentData.providerId,
        lastPaymentDate: new Date(),
        nextBillingDate: endDate,
      };

      const subscription = manager.create(SubscriptionEntity, subscriptionDto);
      await manager.save(subscription);

      const updateUserDto: UpdateUserDto = {
        trialEndDate: undefined,
        ...(paymentData.provider === PaymentProvider.STRIPE.toString() && {
          stripeCustomerId: paymentData.providerId,
        }),
        ...(paymentData.provider === PaymentProvider.PAYPAL.toString() && {
          paypalCustomerId: paymentData.providerId,
        }),
      };

      await manager.update(UserEntity, userId, updateUserDto);
      const updatedUser = await manager.findOneBy(UserEntity, { id: userId });

      if (!updatedUser) {
        throw new NotFoundException(
          this.messagesService.getError('USER', 'CREATED_USER_NOT_FOUND'),
        );
      }

      if (existingSubscription) {
        await manager.update(SubscriptionEntity, existingSubscription.id, {
          autoRenew: false,
          nextBillingDate: undefined,
        });
      }

      return { user: updatedUser, subscription };
    });
  }

  async findActiveSubscription(userId: string): Promise<SubscriptionEntity> {
    const subscription =
      await this.subscriptionRepository.findActiveSubscription(userId);
    if (!subscription) {
      throw new NotFoundException(
        this.messagesService.getError('SUBSCRIPTION', 'NOT_FOUND'),
      );
    }
    return subscription;
  }

  async getUserWithSubscription(whatsappId: string) {
    const user = await this.userRepository.findByWhatsappId(whatsappId);
    if (!user) return null;

    const activeSubscription = await this.findActiveSubscription(user.id);
    return { user, activeSubscription };
  }
}
