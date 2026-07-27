import { SignJWT } from 'jose';

const TEST_JWT_SECRET = new TextEncoder().encode(
  'test-secret-key-for-signing-jwt',
);

export async function createTestJwt({
  exp,
  sub = 'tester@bottle-note.com',
}: {
  exp?: number;
  sub?: string;
} = {}) {
  const token = new SignJWT({
    sub,
    userId: 1,
    roles: 'ROLE_USER',
    profile: null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt();

  if (exp !== undefined) {
    token.setExpirationTime(exp);
  }

  return token.sign(TEST_JWT_SECRET);
}
