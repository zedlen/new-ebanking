import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request =
      ctx.getRequest<
        Request<Record<string, unknown>, any, Record<string, unknown>>
      >();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const { stack, cause, name, message: exceptionMessage } = exception;
    const body =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>)
        : { message: exceptionResponse };
    const message = (body['message'] as string) || exceptionMessage;
    const responseData = body['data'] ?? exceptionMessage;
    const error = (body['error'] as string) || exceptionMessage;
    this.logger.error({
      statusCode: status,
      timestamp: new Date().toISOString(),
      error,
      message,
      stack,
      body: request.body,
      params: request.params,
      cause,
      name,
    });

    const data =
      typeof responseData === 'string'
        ? { message: responseData }
        : responseData;
    response.status(status).json({
      code: status,
      timestamp: new Date().toISOString(),
      error,
      message,
      cause,
      name,
      data: {
        error: true,
        ...(typeof data === 'object' ? data : {}),
        ...(typeof body?.session === 'object' ? { session: body.session } : {}),
      },
    });
  }
}
