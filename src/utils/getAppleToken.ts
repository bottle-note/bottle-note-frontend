import { createPrivateKey } from 'crypto';
import { SignJWT } from 'jose';

export const getAppleToken = async () => {
  const keyContent = Buffer.from(process.env.APPLE_KEY!, 'base64').toString(
    'utf-8',
  );
  const key = `-----BEGIN PRIVATE KEY-----\n${keyContent}\n-----END PRIVATE KEY-----`;

  const teamId = process.env.APPLE_TEAM_ID!;
  const appleId = process.env.APPLE_ID!;

  const appleToken = await new SignJWT({})
    .setAudience('https://appleid.apple.com')
    .setIssuer(teamId)
    .setIssuedAt(new Date().getTime() / 1000)
    .setExpirationTime(new Date().getTime() / 1000 + 3600 * 2)
    .setSubject(appleId)
    .setProtectedHeader({
      alg: 'ES256',
      kid: process.env.APPLE_KEY_ID,
    })
    .sign(createPrivateKey(key));
  return appleToken;
};
