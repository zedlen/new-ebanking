import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NonProductionGuard } from './non-production.guard';

describe('NonProductionGuard', () => {
  it('allows access outside production', () => {
    const guard = new NonProductionGuard({
      get: (key: string) => (key === 'NODE_ENV' ? 'development' : undefined),
    } as ConfigService);
    expect(guard.canActivate()).toBe(true);
  });

  it('returns 404 in production (SEC-03)', () => {
    const guard = new NonProductionGuard({
      get: (key: string) => (key === 'NODE_ENV' ? 'production' : undefined),
    } as ConfigService);
    expect(() => guard.canActivate()).toThrow(NotFoundException);
  });
});
