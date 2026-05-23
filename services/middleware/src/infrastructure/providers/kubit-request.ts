import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { resendHeaders } from '@middleware/domain/utils/resendHeaders';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class KubitRequest {
  private readonly logger = new Logger(KubitRequest.name);
  private readonly OTP_ERRORS_MSG = ['otp', '2fa'];

  constructor(private readonly httpService: HttpService) {}

  private is2faError(responseData: any): boolean {
    if (typeof responseData != 'string') return false;
    const message = responseData.toLowerCase();
    if (this.OTP_ERRORS_MSG.some((msg) => message.includes(msg))) return true;
    return false;
  }

  private async errorHandler(err) {
    const logData = {
      stack: err?.stack,
      resp: err?.response?.data || err?.response || err,
      config: {
        method: err?.config?.method,
        url: err?.config?.url,
        data: err?.config?.data,
        headers: err?.config?.headers,
      },
      status: err?.response?.status,
    };
    this.logger.error(logData);
    const responseData = err?.response?.data || {};
    const message =
      responseData?.error?.message ||
      responseData?.message ||
      err.message ||
      err;
    const response = { message: message, data: responseData };
    if (err.code === 'ENOTFOUND') throw new NotFoundException(message);
    if (
      err.status === 401 &&
      this.is2faError(typeof responseData === 'string' ? responseData : message)
    )
      throw new ForbiddenException(responseData);
    if (err.status === 401) throw new UnauthorizedException(response);
    if (err.status === 404) throw new NotFoundException(response);
    if (err.status === 400) throw new BadRequestException(response);
    if (err.status === 422) throw new UnprocessableEntityException(response);
    if (err.status === 409) throw new ConflictException(message);
    if (err.status === 403) throw new ForbiddenException(message);
    throw new HttpException(response, err.status || 500);
  }

  async getRequest(
    appUrl: string,
    requestUrl: string,
    apiKey: string,
    userToken: string,
    headers?: any,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${appUrl}${requestUrl}`, {
          headers: {
            'Kubit-Api-Key': apiKey,
            Authorization: `Bearer ${userToken}`,
            ...resendHeaders(headers),
          },
        }),
      );
      this.logger.log({
        data: requestUrl.includes('enroll') ? {} : response.data,
        request: `${appUrl}${requestUrl}`,
      });
      return response.data || {};
    } catch (err) {
      await this.errorHandler(err);
    }
  }

  async postRequest(
    appUrl: string,
    requestUrl: string,
    apiKey: string,
    userToken: string,
    data,
    otp?: string | null,
    headers?: any,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${appUrl}${requestUrl}`, data, {
          headers: {
            'Kubit-Api-Key': apiKey,
            Authorization: `Bearer ${userToken}`,
            ...(otp ? { 'Kubit-OTP': otp } : {}),
            ...resendHeaders(headers),
          },
        }),
      );
      this.logger.log({
        body: data,
        data: requestUrl.includes('enroll') ? {} : response.data,
        request: `${appUrl}${requestUrl}`,
      });
      return response.data || {};
    } catch (err) {
      await this.errorHandler(err);
    }
  }

  async putRequest(
    appUrl: string,
    requestUrl: string,
    apiKey: string,
    userToken: string,
    data: any,
    headers?: any,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${appUrl}${requestUrl}`, data, {
          headers: {
            'Kubit-Api-Key': apiKey,
            Authorization: `Bearer ${userToken}`,
            ...resendHeaders(headers),
          },
        }),
      );
      this.logger.log({
        data: requestUrl.includes('enroll') ? {} : response.data,
        request: `${appUrl}${requestUrl}`,
      });
      return response.data || {};
    } catch (err) {
      await this.errorHandler(err);
    }
  }
}
