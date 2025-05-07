import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeHttpService {
  public readonly stripe: Stripe;
  private readonly logger = new Logger(StripeHttpService.name);

  constructor(private config: ConfigService) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY no está definida en la configuración');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-04-30.basil',
    });
  }
}
