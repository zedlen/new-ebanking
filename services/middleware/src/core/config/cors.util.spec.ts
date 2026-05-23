import { resolveAllowedCorsMethods } from './cors.util';

describe('resolveAllowedCorsMethods', () => {
  it('rejects wildcard methods in production (SEC-04)', () => {
    expect(resolveAllowedCorsMethods('production', '*')).toBe(
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
  });

  it('keeps explicit methods in production', () => {
    expect(resolveAllowedCorsMethods('production', 'GET,POST')).toBe('GET,POST');
  });

  it('allows wildcard in development', () => {
    expect(resolveAllowedCorsMethods('development', '*')).toBe('*');
  });
});
