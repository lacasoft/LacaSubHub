import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super({ message, error: 'PaymentError' }, status);
  }
}

export class PaymentProviderNotFoundException extends PaymentException {
  constructor(provider: string) {
    super(
      `Payment provider '${provider}' not found or not configured.`,
      HttpStatus.BAD_REQUEST,
    );
    this.name = 'PaymentProviderNotFoundException';
  }
}

export class PaymentProcessingFailedException extends PaymentException {
  constructor(provider: string, reason: string) {
    super(
      `Processing payment via ${provider} failed. Reason: ${reason}`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
    this.name = 'PaymentProcessingFailedException';
  }
}

export class InvalidPaymentDataException extends PaymentException {
  constructor(details: string) {
    super(
      `Invalid payment data provided. Details: ${details}`,
      HttpStatus.BAD_REQUEST,
    );
    this.name = 'InvalidPaymentDataException';
  }
}
