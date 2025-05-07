import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthIndicator } from './common/health/health';
import { UsersModule } from './modules/users/users.module';
import { MessagesModule } from './common/utils/messages/messages.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UserSubscriptionModule } from './modules/user-subscription/user-subscription.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    TerminusModule,
    UsersModule,
    MessagesModule,
    SubscriptionsModule,
    UserSubscriptionModule,
    PaymentsModule,
    ThrottlerModule.forRoot([
      {
        ttl: seconds(60),
        limit: 50,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    HealthIndicator,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
