import { createPrivateKey } from 'crypto';
import { SignJWT } from 'jose';

export const getAppleToken = async () => {
  const key = `-----BEGIN PRIVATE KEY-----\n${process.env.APPLE_KEY}\n-----END PRIVATE KEY-----\n`;

  const teamId = process.env.APPLE_TEAM_ID as string;
  const appleId = process.env.APPLE_ID as string;

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
