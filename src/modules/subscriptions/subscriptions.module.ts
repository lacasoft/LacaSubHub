import { Module } from '@nestjs/common';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { SubscriptionsService } from './services/subscriptions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionEntity } from './entities/subscription.entity';
import { SubscriptionRepository } from './repositories/subscriptions.repository';
import { MessagesModule } from 'src/common/utils/messages/messages.module';
import { UserSubscriptionModule } from '../user-subscription/user-subscription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionEntity]),
    MessagesModule,
    UserSubscriptionModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionRepository],
  exports: [SubscriptionRepository, SubscriptionsService],
})
export class SubscriptionsModule {}
