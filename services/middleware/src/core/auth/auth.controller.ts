import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { AuthService, OTPAction } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { extractHeaders } from '@middleware/domain/utils/extractHeaders';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(':appName/:env/sign-in')
  signIn(
    @Param('appName') appName: string,
    @Param('env') env: string,
    @Body() body: SignInDto,
    @Res({ passthrough: true }) response,
    @Headers() headers: Record<string, string>,
  ) {
    return this.authService.signIn(appName, env, body, response, headers);
  }

  @Post('sign-out')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  signOut(
    @Headers() headers: Record<string, string>,
    @Res({ passthrough: true }) response,
  ) {
    return this.authService.endSession(
      headers['API_URL'],
      headers['API_KEY'],
      headers['USER_TOKEN'],
      response,
      headers['TID'],
      headers,
    );
  }

  @Post(':appName/:env/recover-password')
  @HttpCode(200)
  recoverPassword(
    @Param('appName') appName: string,
    @Param('env') env: string,
    @Body() data: { customerId?: string; email?: string },
    @Headers() headers: Record<string, string>,
  ) {
    return this.authService.recoverPassword(appName, env, data, headers);
  }

  @Get('users/authuser')
  @UseGuards(AuthGuard)
  async getAuthUser(@Headers() headers: Record<string, string>) {
    const data = await this.authService.getCurrentUser(
      headers['API_URL'],
      headers['API_KEY'],
      headers['USER_TOKEN'],
      headers,
    );
    return { data };
  }

  @Post('2fa/enroll')
  @UseGuards(AuthGuard)
  enrollOtp(@Headers() headers: Record<string, string>) {
    return this.authService.enrollOtp(
      headers['API_URL'],
      headers['API_KEY'],
      headers['USER_TOKEN'],
      headers,
      headers['USER_ID'],
    );
  }

  @Post('2fa/validate')
  @UseGuards(AuthGuard)
  validateOtp(
    @Headers() headers: Record<string, string>,
    @Query('thalosUserId') thalosUserId: string,
  ) {
    return this.authService.validateOtp(
      headers['API_URL'],
      headers['API_KEY'],
      headers['USER_TOKEN'],
      headers,
      headers['USER_ID'],
      thalosUserId,
    );
  }

  @Post('password/update')
  @UseGuards(AuthGuard)
  updatePassword(
    @Headers() headers: Record<string, string>,
    @Body() data: { new_password: string },
  ) {
    return this.authService.changeCredential(
      headers['API_URL'],
      headers['API_KEY'],
      headers['USER_TOKEN'],
      data,
      headers,
    );
  }

  @Post('me')
  @UseGuards(AuthGuard)
  updateUserData(
    @Headers() headers: Record<string, string>,
    @Body() data: { name?: string; image?: string },
  ) {
    return this.authService.updateUserData(headers['USER_ID'], data);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getUser(@Headers() headers: Record<string, string>) {
    const info = extractHeaders(headers);
    return this.authService.getUserData(info, info.userId, headers);
  }

  @Post('generate-otp-code/:action')
  @UseGuards(AuthGuard)
  generateOtpCode(
    @Headers() headers: Record<string, string>,
    @Param('action') action: OTPAction,
  ) {
    return this.authService.generateOTPCode(
      headers['USER_ID'],
      action,
      headers['APP_NAME'],
    );
  }
}
