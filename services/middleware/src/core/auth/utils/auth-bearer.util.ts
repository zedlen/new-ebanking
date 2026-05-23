import { UnauthorizedException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';

/** SHA-256 hex fingerprint sent by clients as Bearer token (SEC-05). */
export function hashSessionTokenForBearer(userToken: string): string {
  return createHash('sha256').update(userToken).digest('hex');
}

/** SEC-02: Bearer must match session token fingerprint (timing-safe). */
export function assertBearerMatchesAuthorization(
  authorization: string | undefined,
  userTokenForRequest: string,
): void {
  const [type, headerToken] = (authorization ?? '').split(' ');
  if (type !== 'Bearer' || !headerToken) {
    throw new UnauthorizedException('Bearer token is required');
  }
  const expected = hashSessionTokenForBearer(userTokenForRequest);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(headerToken, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new UnauthorizedException('Token is not valid');
  }
}
