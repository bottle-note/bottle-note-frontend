import { User } from 'next-auth';
import { AuthApi } from '@/app/api/AuthApi';
import { SOCIAL_TYPE, TokenData } from '@/types/Auth';

async function handleAppleLogin(user: User): Promise<TokenData | null> {
  if (!user.authroizationCode) return null;

  const body = {
    provider: SOCIAL_TYPE.APPLE,
    authroizationCode: user.authroizationCode,
  };

  return AuthApi.server.appleLogin(body);
}

async function handleKakaoLogin(user: User): Promise<TokenData | null> {
  if (user.authroizationCode) {
    const kakaoToken = await AuthApi.server.fetchKakaoToken(
      user.authroizationCode,
    );
    const userData = await AuthApi.server.fetchKakaoUserInfo(
      kakaoToken.access_token,
    );
    const loginPayload = {
      email: userData.kakao_account?.email ?? 'no-email',
      gender: null,
      age: null,
      socialType: SOCIAL_TYPE.KAKAO,
      socialUniqueId: '',
    };
    return AuthApi.server.login(loginPayload);
  }

  if (user.accessToken) {
    const body = {
      provider: SOCIAL_TYPE.KAKAO,
      accessToken: user.accessToken,
    };
    return AuthApi.server.kakaoLogin(body);
  }

  if (user.email) {
    return AuthApi.server.login({
      socialType: SOCIAL_TYPE.KAKAO,
      email: user.email,
      socialUniqueId: '',
      gender: null,
      age: null,
    });
  }

  return null;
}

export const providerHandlers: {
  [key: string]: (user: User) => Promise<TokenData | null>;
} = {
  'apple-login': handleAppleLogin,
  'kakao-login': handleKakaoLogin,
};
