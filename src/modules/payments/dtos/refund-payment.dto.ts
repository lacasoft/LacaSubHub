import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RefundPaymentDto {
  @IsString()
  paymentId: string;

  @IsNumber()
  @Min(0.5)
  amount: number;

  @IsOptional()
  reason?: string;

  @IsString()
  whatsappId: string;
}
