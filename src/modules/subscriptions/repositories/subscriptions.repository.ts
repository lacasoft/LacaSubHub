import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';

@Injectable()
export class SubscriptionRepository {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private repository: Repository<SubscriptionEntity>,
  ) {}

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<SubscriptionEntity> {
    const subscription = this.repository.create(createSubscriptionDto);
    return this.repository.save(subscription);
  }

  async findActiveSubscription(
    userId: string,
  ): Promise<SubscriptionEntity | undefined> {
    const now = new Date();

    const result = await this.repository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(now),
      },
      order: { endDate: 'DESC' },
    });

    return result ?? undefined;
  }
}
