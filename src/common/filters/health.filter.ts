/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  ArgumentsHost,
  ExceptionFilter,
  Catch,
  HttpStatus,
} from '@nestjs/common';
import { HealthCheckException } from '../exceptions/health.exception';

@Catch(HealthCheckException)
export class HealthCheckExceptionFilter implements ExceptionFilter {
  catch(exception: HealthCheckException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const data = exception.getDetails();

    response.status(HttpStatus.OK).json({
      data,
      status_code: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    });
  }
}
