import { IsIn, IsOptional, IsString } from 'class-validator';
import { APP_MODULES } from '../constants/app-modules';

export class SignInDto {
  @IsString()
  username!: string;

  @IsString()
  password!: string;

  @IsIn(APP_MODULES)
  module!: string;

  @IsOptional()
  forced?: boolean;

  @IsOptional()
  @IsString()
  pbk?: string;
}
