import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessagesService } from 'src/common/utils/messages/messages.service';

import { UserSubscriptionService } from 'src/modules/user-subscription/services/user-subscription.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../repositories/user.repostory';
import { SubscriptionResponseDto } from 'src/modules/subscriptions/dto/subscription-response.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly messagesService: MessagesService,
    private readonly userSubscriptionService: UserSubscriptionService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{
    user: UserResponseDto;
    trialSubscription?: SubscriptionResponseDto;
  }> {
    return this.userRepository.runInTransaction(async (transactionManager) => {
      const existingUser = await this.userRepository.findByWhatsappId(
        createUserDto.whatsappId,
      );

      if (existingUser) {
        throw new ConflictException(
          this.messagesService.getError('USER', 'ALREADY_EXISTS'),
        );
      }

      const user = await this.userRepository.create(createUserDto);

      const trialSubscription =
        await this.userSubscriptionService.createTrialSubscriptionWithTransaction(
          user.id,
          transactionManager,
        );

      await this.userRepository.update(user.id, {
        trialEndDate: trialSubscription.endDate,
      });

      const updatedUser = await this.userRepository.findOne(user.id);

      if (!updatedUser) {
        throw new Error(
          this.messagesService.getError('USER', 'CREATED_USER_NOT_FOUND'),
        );
      }

      const userPlain = instanceToPlain(updatedUser);
      const subscriptionPlain = instanceToPlain(trialSubscription);

      const userResponse = plainToInstance(UserResponseDto, userPlain);
      const subscriptionResponse = plainToInstance(
        SubscriptionResponseDto,
        subscriptionPlain,
      );

      return {
        user: userResponse,
        trialSubscription: subscriptionResponse,
      };
    });
  }

  async checkWhatsappId(whatsappId: string): Promise<{
    user: UserResponseDto;
    activeSubscription?: SubscriptionResponseDto;
  } | null> {
    const user = await this.userRepository.findByWhatsappId(whatsappId);
    if (!user) {
      throw new NotFoundException(
        this.messagesService.getError('USER', 'DOES_NOT_EXISTS'),
      );
    }

    const activeSubscription =
      await this.userSubscriptionService.findActiveSubscription(user.id);

    if (!activeSubscription) {
      throw new HttpException(
        this.messagesService.getError('SUBSCRIPTION', 'EXPIRED'),
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const userPlain = instanceToPlain(user);
    const subscriptionPlain = instanceToPlain(activeSubscription);

    const userResponse = plainToInstance(UserResponseDto, userPlain);
    const subscriptionResponse = plainToInstance(
      SubscriptionResponseDto,
      subscriptionPlain,
    );
    return {
      user: userResponse,
      activeSubscription: subscriptionResponse,
    };
  }

  async findByWhatsappId(whatsappId: string): Promise<{ user: UserEntity }> {
    const user = await this.userRepository.findByWhatsappId(whatsappId);
    if (!user) {
      throw new NotFoundException(
        this.messagesService.getError('USER', 'DOES_NOT_EXISTS'),
      );
    }
    return { user };
  }
}
