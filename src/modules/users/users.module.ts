import { Module } from '@nestjs/common';
import { UsersController } from './controller/users.controller';
import { UsersService } from './services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repostory';
import { MessagesModule } from 'src/common/utils/messages/messages.module';
import { UserSubscriptionModule } from '../user-subscription/user-subscription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MessagesModule,
    UserSubscriptionModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UserRepository, UsersService],
})
export class UsersModule {}
