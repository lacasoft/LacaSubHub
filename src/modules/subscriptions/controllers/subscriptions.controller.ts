import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SubscriptionsService } from '../services/subscriptions.service';
import { SubscriptionGuard } from 'src/common/guards/subscription.guard';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseInterceptors(ClassSerializerInterceptor)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @UseGuards(SubscriptionGuard)
  @Get()
  @ApiQuery({ name: 'whatsappId', description: 'ID de WhatsApp del usuario' })
  @HttpCode(HttpStatus.OK)
  async checkStatus(@Query('whatsappId') whatsappId: string) {
    return await this.subscriptionsService.checkSubscriptionStatus(whatsappId);
  }
}
