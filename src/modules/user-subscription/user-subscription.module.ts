import { Module } from '@nestjs/common';
import { UserSubscriptionService } from './services/user-subscription.service';
import { SubscriptionRepository } from '../subscriptions/repositories/subscriptions.repository';
import { UserRepository } from '../users/repositories/user.repostory';
import { MessagesModule } from 'src/common/utils/messages/messages.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionEntity } from '../subscriptions/entities/subscription.entity';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SubscriptionEntity]),
    MessagesModule,
  ],
  providers: [UserSubscriptionService, UserRepository, SubscriptionRepository],
  exports: [UserSubscriptionService],
})
export class UserSubscriptionModule {}
