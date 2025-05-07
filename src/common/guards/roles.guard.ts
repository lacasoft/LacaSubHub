import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRole } from '../enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UsersService } from 'src/modules/users/services/users.service';
import { MessagesService } from '../utils/messages/messages.service';

@Injectable()
export class WhatsappRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
    private messagesService: MessagesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<UserRole[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) return true;

    const request: Request = context.switchToHttp().getRequest<Request>();
    const whatsappId = this.extractWhatsappId(request);

    if (!whatsappId) {
      throw new BadRequestException(
        this.messagesService.getError('AUTH', 'WHATSAPPID_REQUIRED'),
      );
    }

    const { user } = await this.usersService.findByWhatsappId(whatsappId);
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        this.messagesService.getError('AUTH', 'ROLE_ACCESS_DENIED') +
          requiredRoles.join(', '),
      );
    }

    request.user = user;

    return true;
  }

  private extractWhatsappId(
    request: Request & { params?: Record<string, any> },
  ): string | undefined {
    return (
      request.params?.['whatsappId'] ||
      request.query?.['whatsappId'] ||
      request.body?.['whatsappId']
    );
  }
}
