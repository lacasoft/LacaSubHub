/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response: Response = context.getResponse();
    const request: Request = context.getRequest();
    const { url: path } = request;
    const cathExeption: any = exception.getResponse();
    const code =
      cathExeption.statusCode || cathExeption.status || exception.getStatus();
    const { error } = cathExeption;
    const timestamp = new Date().toISOString();
    const message = cathExeption.message || exception.message;
    const errorResponse = { code, error, path, timestamp, message };

    if (exception.getStatus() === HttpStatus.INTERNAL_SERVER_ERROR)
      response.status(HttpStatus.BAD_REQUEST).json(errorResponse);
    else response.status(exception.getStatus()).json(errorResponse);
  }
}
