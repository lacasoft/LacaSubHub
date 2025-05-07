import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../services/users.service';
import { SubscriptionResponseDto } from 'src/modules/subscriptions/dto/subscription-response.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto): Promise<{
    user: UserResponseDto;
    trialSubscription?: SubscriptionResponseDto;
  }> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @ApiQuery({ name: 'whatsappId', description: 'ID de WhatsApp del usuario' })
  @HttpCode(HttpStatus.OK)
  async checkRegistration(@Query('whatsappId') whatsappId: string): Promise<{
    user: UserResponseDto;
    activeSubscription?: SubscriptionResponseDto;
  } | null> {
    return await this.usersService.checkWhatsappId(whatsappId);
  }
}
