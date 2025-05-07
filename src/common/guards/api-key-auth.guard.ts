import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { MessagesService } from 'src/common/utils/messages/messages.service';

import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyAuthGuard.name);
  private readonly API_KEY_HEADER = 'x-api-key';
  private readonly API_SECRET_HEADER = 'x-api-secret';

  constructor(
    private readonly configService: ConfigService,
    private readonly messagesService: MessagesService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    try {
      this.validateApiCredentials(request);
      return true;
    } catch (error) {
      this.logger.warn(
        this.messagesService.getError('AUTH', 'UNAUTHORIZED_ATTEMPT'),
        error.message,
      );
      throw error;
    }
  }

  private validateApiCredentials(request: Request): void {
    const apiKey = this.extractApiKey(request);
    const apiSecret = this.extractApiSecret(request);

    const expectedApiKey = this.getExpectedApiKey();
    const expectedApiSecret = this.getExpectedApiSecret();

    if (apiKey !== expectedApiKey || apiSecret !== expectedApiSecret) {
      throw new UnauthorizedException(
        this.messagesService.getError('AUTH', 'INVALID_API_CREDENTIALS'),
      );
    }
  }

  private extractApiKey(request: Request): string {
    const apiKey = request.headers[this.API_KEY_HEADER] as string | undefined;
    if (!apiKey) {
      throw new UnauthorizedException(
        this.messagesService.getError('AUTH', 'INVALID_API_CREDENTIALS'),
      );
    }
    return apiKey;
  }

  private extractApiSecret(request: Request): string {
    const apiSecret = request.headers[this.API_SECRET_HEADER] as
      | string
      | undefined;
    if (!apiSecret) {
      throw new UnauthorizedException(
        this.messagesService.getError('AUTH', 'INVALID_API_CREDENTIALS'),
      );
    }
    return apiSecret;
  }

  private getExpectedApiKey(): string {
    const apiKey = this.configService.get<string>('BOT_API_KEY');
    if (!apiKey) {
      throw new Error(
        this.messagesService.getError('AUTH', 'API_CREDENTIALS_NOT_CONFIGURED'),
      );
    }
    return apiKey;
  }

  private getExpectedApiSecret(): string {
    const apiSecret = this.configService.get<string>('BOT_API_SECRET');
    if (!apiSecret) {
      throw new Error(
        this.messagesService.getError('AUTH', 'API_CREDENTIALS_NOT_CONFIGURED'),
      );
    }
    return apiSecret;
  }
}
