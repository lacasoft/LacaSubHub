import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from 'src/common/enums/user-role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  pinHash?: string;

  @IsOptional()
  @IsString()
  role?: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  trialEndDate?: Date;

  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @IsOptional()
  @IsString()
  paypalCustomerId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deletedAt?: Date | null;
}
