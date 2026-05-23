import { UnauthorizedException } from '@nestjs/common';
import {
  assertBearerMatchesAuthorization,
  hashSessionTokenForBearer,
} from './auth-bearer.util';

describe('auth-bearer.util', () => {
  const sessionToken = 'kubit-session-token-abc';

  it('hashSessionTokenForBearer returns stable SHA-256 hex', () => {
    const a = hashSessionTokenForBearer(sessionToken);
    const b = hashSessionTokenForBearer(sessionToken);
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it('assertBearerMatchesAuthorization accepts matching Bearer fingerprint', () => {
    const hash = hashSessionTokenForBearer(sessionToken);
    expect(() =>
      assertBearerMatchesAuthorization(`Bearer ${hash}`, sessionToken),
    ).not.toThrow();
  });

  it('rejects missing Bearer prefix (SEC-02)', () => {
    expect(() => assertBearerMatchesAuthorization(undefined, sessionToken)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects wrong Bearer fingerprint (timing-safe path)', () => {
    expect(() =>
      assertBearerMatchesAuthorization('Bearer deadbeef', sessionToken),
    ).toThrow(UnauthorizedException);
  });
});
