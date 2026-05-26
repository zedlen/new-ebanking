import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomInt } from 'crypto';
import { v4 } from 'uuid';
import { FeatureFlagService } from '@middleware/application/services/feature-flag/featureFlag.service';
import { ResolveUserContextService } from '@middleware/application/orchestrators/resolve-user-context.service';
import { AppModule } from '@middleware/core/auth/constants/app-modules';
import { AppCredentialsRepository } from '@middleware/domain/repositories/appCredentials.interface';
import { OpensessionRepository } from '@middleware/domain/repositories/openSessions.interface';
import { UserRepository } from '@middleware/domain/repositories/user.interface';
import { BrowserDetection } from '@middleware/domain/utils/browserDetection';
import { KubitRequest } from '@middleware/infrastructure/providers/kubit-request';
import { SignInDto } from './dto/sign-in.dto';
import { CryptoService } from './services/crypto.service';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';

export enum OTPAction {
  LINK_CARD = 'link_card',
  CANCEL_CARD = 'cancel_card',
  VALIDATE_MAIL = 'validate_mail',
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly ACTIVE_SESSION_MESSAGE =
    'Active session detected. Please wait for the current session to complete before starting a new one.';

  constructor(
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager,
    private readonly appCredentialRepository: AppCredentialsRepository,
    private readonly openSessionRepository: OpensessionRepository,
    private readonly userRepository: UserRepository,
    private readonly featureFlag: FeatureFlagService,
    private readonly kubitService: KubitRequest,
    private readonly browserDetection: BrowserDetection,
    private readonly resolveUserContext: ResolveUserContextService,
  ) {}

  async signIn(
    appName: string,
    env: string,
    data: SignInDto,
    response,
    headers?: Record<string, string>,
  ) {
    let appUrl: string;
    let apiToken: string;
    const module = data.module as AppModule;

    try {
      const appCredential = await this.appCredentialRepository.findOne({
        appName,
        enviroment: env,
      });
      if (!appCredential) throw new UnprocessableEntityException();

      appUrl = appCredential.url;
      apiToken = appCredential.apiKey;

      const loginResponse = await this.kubitService.postRequest(
        appCredential.url,
        '/auth/login',
        appCredential.apiKey,
        '',
        { username: data.username, password: data.password },
        null,
        headers,
      );

      const token = loginResponse?.data?.token;
      if (!token) throw new Error('No token found while making login');

      const tokenToCreate = {
        apn: appName,
        evn: env,
        tk: v4(),
        uid: data.username,
      };
      const sessionLifeTime = parseInt(
        this.configService.get<string>('SESSION_LIFE_TIME') ??
          String(3600 * 1000),
        10,
      );

      const newToken = await this.jwtService.signAsync(tokenToCreate, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: Math.floor(sessionLifeTime / 1000),
      });

      let key = '';
      if (data.pbk) {
        try {
          const keysResponse = await this.kubitService.postRequest(
            appUrl,
            '/auth/keys/exchange',
            apiToken,
            token,
            { public_key: data.pbk },
            null,
            headers,
          );
          key = keysResponse?.data || '';
        } catch (e) {
          this.logger.error({ msg: 'Error while keys exchange', e });
        }
      }

      const cookieKey =
        this.configService.get<string>('COOKIES_TOKEN_INDEX') ?? 'session';
      response.cookie(cookieKey, this.cryptoService.encrypt(newToken), {
        maxAge: sessionLifeTime,
        httpOnly: true,
        sameSite: this.configService.get('COOKIES_SAME_SITE') ?? 'none',
        secure: true,
      });

      await this.cacheManager.set(
        tokenToCreate.tk,
        JSON.stringify({
          t: this.cryptoService.encrypt(token),
          i: data.username,
          m: module,
        }),
        sessionLifeTime,
      );

      const encryptedToken = createHash('sha256').update(token).digest('hex');
      const existingSession = await this.openSessionRepository.findOne({
        u: data.username,
      });
      if (existingSession) {
        await this.openSessionRepository.delete(existingSession.id as string);
      }

      const ua = await this.browserDetection.detect(
        headers?.['user-agent'] ?? '',
        headers?.['referer'],
      );
      await this.openSessionRepository.save({
        agent: ua,
        ip: headers?.['x-forwarded-for'] ?? '0.0.0.0',
        u: data.username,
        tki: this.cryptoService.encrypt(tokenToCreate.tk),
        active: true,
      });

      return { code: 200, status: 'ok', data: { token: encryptedToken, key } };
    } catch (err) {
      const responseData = err?.response?.data || err?.response || {};
      const message =
        responseData?.error?.message || responseData?.message || '';
      if (err.code === 'ENOTFOUND')
        throw new NotFoundException(responseData?.message || err?.message);
      if (err.status === 401 && message?.includes?.('invalid credentials')) {
        throw new UnauthorizedException({ message, data: responseData });
      }
      if (err.status === 401 && message === this.ACTIVE_SESSION_MESSAGE) {
        return this.checkRegisterSession(
          message,
          appName,
          env,
          appUrl!,
          apiToken!,
          data,
          response,
          headers,
        );
      }
      if (err.status === 409)
        throw new ConflictException(responseData?.message);
      if (err.status === 400)
        throw new BadRequestException(responseData?.message);
      if (err.status === 403)
        throw new ForbiddenException(responseData?.message);
      throw new HttpException(err, 500);
    }
  }

  async endSession(
    appUrl: string,
    apiKey: string,
    userToken: string,
    response,
    tk?: string,
    headers?: Record<string, string>,
  ) {
    await this.kubitService.postRequest(
      appUrl,
      '/auth/logout',
      apiKey,
      userToken,
      {},
      null,
      headers,
    );
    const cookieKey =
      this.configService.get<string>('COOKIES_TOKEN_INDEX') ?? 'session';
    response.clearCookie(cookieKey);
    if (tk) {
      const tokenData = await this.cacheManager.get(tk);
      if (tokenData) {
        const { i } = JSON.parse(tokenData as string);
        const userSessions = await this.openSessionRepository.find(
          { u: i },
          { offset: 0, limit: 10 },
        );
        for (const session of userSessions.data) {
          await this.openSessionRepository.delete(session.id as string);
        }
        await this.cacheManager.del(tk);
      }
    }
    return { code: 200, status: 'ok' };
  }

  async checkRegisterSession(
    message: string,
    appName: string,
    appEnv: string,
    appUrl: string,
    apiKey: string,
    data: SignInDto,
    response,
    headers?: Record<string, string>,
  ) {
    const { agent, ip, tki, id } =
      (await this.openSessionRepository.findOne({ u: data.username })) || {};
    if (data.forced && tki) {
      const tokenIndex = this.cryptoService.decrypt(tki);
      const tokenData = await this.cacheManager.get(tokenIndex);
      try {
        const { t } = JSON.parse(tokenData as string);
        await this.endSession(
          appUrl,
          apiKey,
          this.cryptoService.decrypt(t),
          response,
          tokenIndex,
          {
            ...headers,
            'x-forwarded-for': ip as string,
          },
        );
        await this.openSessionRepository.delete(id as string);
        return this.signIn(
          appName,
          appEnv,
          { ...data, forced: false },
          response,
          headers,
        );
      } catch (e) {
        this.logger.error(e);
      }
    }

    throw new ConflictException({ message, session: { agent, ip } });
  }

  async recoverPassword(
    appName: string,
    env: string,
    data: { customerId?: string; email?: string },
    headers: Record<string, string>,
  ) {
    try {
      let { customerId } = data;
      const { email } = data;
      if (!customerId) {
        if (!email) return { status: 'ok', code: 200 };
        const user =
          await this.resolveUserContext.byExternalIdNoValidation(email);
        if (!user) return { status: 'ok', code: 200 };
        customerId = user.external_id || user.id;
      }
      const appCredential = await this.appCredentialRepository.findOne({
        appName,
        enviroment: env,
      });
      if (!appCredential) throw new UnprocessableEntityException();
      await this.kubitService.postRequest(
        appCredential.url,
        `/auth/password/recovery?customerId=${customerId}`,
        appCredential.apiKey,
        '',
        {},
        null,
        headers,
      );
    } catch {
      /* always return ok */
    }
    return { status: 'ok', code: 200 };
  }

  async getCurrentUser(
    appUrl: string,
    apiKey: string,
    userToken: string,
    headers?: Record<string, string>,
  ) {
    const userResponse = await this.kubitService.getRequest(
      appUrl,
      '/auth/users/authuser',
      apiKey,
      userToken,
      headers,
    );
    const { data: userData = {} } = userResponse;
    let userInfo;
    try {
      userInfo = await this.userRepository.findOne({
        username: userData.username,
      });
      if (!userInfo) {
        userInfo = await this.userRepository.save({
          username: userData.username,
          image: 'https://cdn.ebanking-service.net/user.png',
          name: userData.username,
        });
      }
    } catch {
      /* optional local user row */
    }
    return { ...userData, ...userInfo };
  }

  async validateOtp(
    appUrl: string,
    apiKey: string,
    userToken: string,
    headers?: Record<string, string>,
    userId?: string,
    thalosUserId?: string,
  ) {
    let useV2;
    let url = appUrl;
    try {
      useV2 = await this.featureFlag.reviewFeatureForUser(
        userId || '',
        'enroll-otp-v2',
      );
    } catch {
      /* ignore */
    }
    if (useV2?.enable) {
      url = appUrl.replace('v1', 'v2');
      return this.kubitService.postRequest(
        url,
        `/api/v2/auth/2fa/verify?thalosUserId=${thalosUserId}&otp=${(headers?.['Kubit-OTP'] || headers?.['kubit-otp'] || '')?.replace?.('OTP ', '')}`,
        apiKey,
        userToken,
        {},
        null,
        headers,
      );
    }
    return this.kubitService.postRequest(
      appUrl,
      '/auth/2fa/validate',
      apiKey,
      userToken,
      {},
      headers?.['Kubit-OTP'] || headers?.['kubit-otp'],
      headers,
    );
  }

  async enrollOtp(
    appUrl: string,
    apiKey: string,
    userToken: string,
    headers?: Record<string, string>,
    userId?: string,
  ) {
    let url = appUrl;
    try {
      const useV2 = await this.featureFlag.reviewFeatureForUser(
        userId || '',
        'enroll-otp-v2',
      );
      if (useV2?.enable) url = appUrl.replace('v1', 'v2');
    } catch {
      /* ignore */
    }
    return this.kubitService.postRequest(
      appUrl,
      '/auth/2fa/enroll',
      apiKey,
      userToken,
      {},
      null,
      headers,
    );
  }

  async changeCredential(
    appUrl: string,
    apiKey: string,
    userToken: string,
    data: { new_password: string },
    headers?: Record<string, string>,
  ) {
    return this.kubitService.postRequest(
      appUrl,
      '/auth/password/update',
      apiKey,
      userToken,
      { new_password: data.new_password },
      headers?.['Kubit-OTP'] || headers?.['kubit-otp'],
      headers,
    );
  }

  async updateUserData(
    username: string,
    data: { name?: string; image?: string },
  ) {
    const userInfo = await this.userRepository.findOne({ username });
    if (!userInfo) throw new NotFoundException('User not exist');
    return this.userRepository.update(userInfo.id as string, data);
  }

  async getUserData(
    info: HeadersInfo,
    username: string,
    headers: Record<string, string>,
  ) {
    return this.resolveUserContext.byExternalIdNoValidationRequest(
      info,
      username,
      headers,
    );
  }

  async generateOTPCode(_userId: string, _action: OTPAction, _appName: string) {
    throw new NotImplementedException(
      'OTP email generation is wired in Phase 3 with MailingService',
    );
  }
}
