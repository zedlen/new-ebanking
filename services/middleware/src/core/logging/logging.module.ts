import { Module } from '@nestjs/common';
import { Request } from 'express';
import { LoggerModule } from 'nestjs-pino';

const PinoLoggerModule = LoggerModule as unknown as {
  forRoot: (options: any) => any;
};

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers.setCookie',
            'res.headers["set-cookie"]',
            'req.body.password',
            'body.password',
            'req.headers["Kubit-Otp"]',
            'req.headers["kubit-otp"]',
            'data.data.token',
            'body.public_key',
            'data.data.qrcode',
            'config.headers.Authorization',
            'config.headers.authorization',
            'config.headers["Kubit-Api-Key"]',
            'config.headers["kubit-api-key"]',
            'config.headers["Kubit-OTP"]',
            'config.headers["kubit-otp"]',
            'body.new_password',
            'config.data.password',
            'config.data.new_password',
            'req.body.token',
            'req.body.rfc',
            'req.body.curp',
            'req.body.clabe',
            'req.body.account_number',
            'req.body.form_data',
            'req.body.documents',
            'req.body.template',
            'req.body.files',
            'body.token',
            'body.rfc',
            'body.curp',
            'body.clabe',
            'body.form_data',
            'body.documents',
          ],
          censor: '******',
        },
        customProps: (req: Request) => ({
          userId: req.headers['USER_ID'] as string,
          appName: req.headers['APP_NAME'] as string,
          appEnv: req.headers['APP_ENV'] as string,
          appModule: req.headers['APP_MODULE'] as string,
        }),
        autoLogging: {
          ignore: (req: Request) => req.url?.includes('health') ?? false,
        },
      },
    }),
  ],
})
export class LoggingModule {}
