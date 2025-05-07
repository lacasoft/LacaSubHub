/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';

import { CapturePaymentDto } from '../dtos/capture-payment.dto';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { RefundPaymentDto } from '../dtos/refund-payment.dto';
import { SubscriptionPlanType } from 'src/common/enums/subscription-plan-type.enum';
import { SubscriptionGuard } from 'src/common/guards/subscription.guard';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { WhatsappRolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Payments')
@Controller('payments')
@UseInterceptors(ClassSerializerInterceptor)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @UseGuards(SubscriptionGuard)
  @Post('links')
  @HttpCode(HttpStatus.CREATED)
  async generateLink(
    @Body()
    dto: CreatePaymentDto & {
      userId: string;
      planType: SubscriptionPlanType;
      reference?: string;
      whatsappId: string;
    },
  ) {
    dto.metadata = {
      ...dto.metadata,
      userId: dto.userId,
      planType: dto.planType,
    };

    const payment = await this.payments.create(dto);

    return {
      paymentId: payment.id,
      paymentUrl:
        'paymentUrl' in payment && typeof payment.paymentUrl === 'string'
          ? payment.paymentUrl
          : (payment.metadata?.approvalUrl ?? payment.metadata?.url ?? null),
      instructions:
        payment.provider === PaymentProvider.BANK_TRANSFER
          ? `Deposita $${payment.amount} ${payment.currency} a ${
              payment.metadata?.reference ?? 'SIN-REF'
            } y envía tu comprobante`
          : null,
    };
  }

  @Post('orders/:orderId/capture')
  @UseGuards(WhatsappRolesGuard)
  @Roles(UserRole.ADMIN)
  async capture(
    @Param('orderId') orderId: string,
    @Body()
    body: {
      userId: string;
      whatsappId: string;
      planType: SubscriptionPlanType;
    },
  ) {
    const dto: CapturePaymentDto = {
      orderId,
      provider: PaymentProvider.BANK_TRANSFER,
    };
    return this.payments.capture(dto, body.userId, body.planType);
  }

  @Post('refund/:paymentId')
  @UseGuards(WhatsappRolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  refund(
    @Param('paymentId') paymentId: string,
    @Body() body: Omit<RefundPaymentDto, 'paymentId'>,
  ) {
    const dto: RefundPaymentDto = { paymentId, ...body };
    return this.payments.refund(dto);
  }
}
