import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

import { Request } from 'express';

import { UserEntity } from 'src/modules/users/entities/user.entity';
import { MessagesService } from 'src/common/utils/messages/messages.service';
import { SubscriptionEntity } from 'src/modules/subscriptions/entities/subscription.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { UserSubscriptionService } from 'src/modules/user-subscription/services/user-subscription.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(
    private readonly userSubscriptionService: UserSubscriptionService,
    private readonly messagesService: MessagesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const whatsappId = this.extractWhatsappId(request);
      const result = await this.validateUser(whatsappId);
      this.validateAccess(result.user, result.activeSubscription);
      return true;
    } catch (error) {
      this.logger.warn(
        this.messagesService.getError('AUTH', 'UNAUTHORIZED_ATTEMPT'),
        error.message,
      );
      throw error;
    }
  }

  private extractWhatsappId(request: Request): string {
    const whatsappId: string =
      request.params.whatsappId ||
      (request.query.whatsappId as string) ||
      (request.body.whatsappId as string);

    if (!whatsappId) {
      throw new ForbiddenException(
        this.messagesService.getError('USER', 'ID_NOT_PROVIDED'),
      );
    }

    return whatsappId.toString();
  }

  private async validateUser(whatsappId: string): Promise<{
    user: UserEntity;
    activeSubscription?: SubscriptionEntity;
  }> {
    const result =
      await this.userSubscriptionService.getUserWithSubscription(whatsappId);
    if (!result) {
      throw new ForbiddenException(
        this.messagesService.getError('USER', 'DOES_NOT_EXISTS'),
      );
    }
    return result;
  }

  private validateAccess(
    user: UserEntity,
    subscriptionEntity?: SubscriptionEntity,
  ): void {
    const hasValidSubscription =
      subscriptionEntity && this.isSubscriptionValid(subscriptionEntity);

    const hasActiveTrial =
      user.trialEndDate && new Date(user.trialEndDate) > new Date();

    if (!hasValidSubscription && !hasActiveTrial) {
      throw new ForbiddenException(
        this.messagesService.getError('AUTH', 'SUBSCRIPTION_REQUIRED'),
      );
    }
  }

  private isSubscriptionValid(subscriptionEntity: SubscriptionEntity): boolean {
    const now = new Date();
    return (
      subscriptionEntity.status === SubscriptionStatus.ACTIVE &&
      subscriptionEntity.endDate > now
    );
  }
}
