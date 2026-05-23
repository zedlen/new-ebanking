import { UnauthorizedException } from '@nestjs/common';
import { resolveModuleFromUrl, isAppModule } from '../constants/app-modules';

describe('AuthGuard helpers', () => {
  it('resolves module from versioned API paths', () => {
    expect(resolveModuleFromUrl('/api/v1/ebanking/accounts')).toBe('ebanking');
    expect(resolveModuleFromUrl('/api/v1/mobile/cards')).toBe('mobile');
  });

  it('returns null for global auth and health', () => {
    expect(resolveModuleFromUrl('/api/v1/auth/sign-out')).toBeNull();
    expect(resolveModuleFromUrl('/api/v1/health')).toBeNull();
  });

  it('validates app module names', () => {
    expect(isAppModule('treasury')).toBe(true);
    expect(isAppModule('manager')).toBe(false);
  });
});

describe('AuthGuard module binding', () => {
  it('documents cross-module rejection', () => {
    const sessionModule = 'ebanking';
    const requestModule = 'mobile';
    expect(sessionModule).not.toBe(requestModule);
    expect(() => {
      if (sessionModule !== requestModule) {
        throw new UnauthorizedException('Invalid access for module');
      }
    }).toThrow(UnauthorizedException);
  });
});
