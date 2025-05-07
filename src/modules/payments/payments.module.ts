import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaypalHttpService } from 'src/common/http/paypal-http.service';
import { PaypalAdapter } from './adapters/paypal.adapter';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentsService } from './services/payments.service';
import { StripeAdapter } from './adapters/stripe.adapter';
import { StripeHttpService } from 'src/common/http/stripe-http.service';
import { BankTransferAdapter } from './adapters/bank-transfer.adapter';
import { PaypalWebhookController } from './controllers/paypal-webhook.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { PaypalVerifierService } from 'src/common/http/paypal-verifier.service';
import { SubscriptionGuard } from 'src/common/guards/subscription.guard';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from 'src/common/utils/messages/messages.module';
import { UserSubscriptionModule } from '../user-subscription/user-subscription.module';
import { PaymentListener } from '../subscriptions/listeners/payment.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    UsersModule,
    MessagesModule,
    UserSubscriptionModule,
  ],
  controllers: [
    PaymentsController,
    StripeWebhookController,
    PaypalWebhookController,
  ],
  providers: [
    PaypalHttpService,
    PaypalVerifierService,
    StripeHttpService,
    PaypalAdapter,
    StripeAdapter,
    BankTransferAdapter,
    PaymentsService,
    SubscriptionGuard,
    PaymentListener,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
