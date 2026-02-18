import { User } from 'next-auth';
import { AuthApi } from '@/api/auth/auth.api';
import { SOCIAL_TYPE, TokenData } from '@/api/auth/types';

async function handlePreviewLogin(_user: User): Promise<TokenData | null> {
  const email = process.env.PREVIEW_TEST_EMAIL;
  const password = process.env.PREVIEW_TEST_PASSWORD;

  if (!email || !password) {
    console.error(
      'Preview login failed: PREVIEW_TEST_EMAIL or PREVIEW_TEST_PASSWORD not set',
    );
    return null;
  }

  return AuthApi.server.basicLogin({ email, password });
}

async function handleAppleLogin(user: User): Promise<TokenData | null> {
  if (!user.idToken || !user.nonce) return null;

  const body = {
    idToken: user.idToken,
    nonce: user.nonce,
  };

  return AuthApi.server.appleLogin(body);
}

async function handleKakaoLogin(user: User): Promise<TokenData | null> {
  try {
    if (user.authorizationCode) {
      const kakaoToken = await AuthApi.server.fetchKakaoToken(
        user.authorizationCode,
      );

      // 카카오 토큰 응답 검증
      if (!kakaoToken?.access_token) {
        console.error(
          'Kakao login failed: No access token received from Kakao',
        );
        return null;
      }

      const userData = await AuthApi.server.fetchKakaoUserInfo(
        kakaoToken.access_token,
      );

      // 카카오 사용자 정보 검증
      if (!userData.kakao_account?.email) {
        console.error('Kakao login failed: Invalid user data from Kakao');
        return null;
      }

      const loginPayload = {
        email: userData.kakao_account.email,
        gender: null,
        age: null,
        socialType: SOCIAL_TYPE.KAKAO,
        socialUniqueId: String(userData.id),
      };

      return await AuthApi.server.login(loginPayload);
    }

    if (user.accessToken) {
      return await AuthApi.server.kakaoLogin({ accessToken: user.accessToken });
    }

    // 이메일 기반 로그인 (fallback)
    if (user.email) {
      return await AuthApi.server.login({
        socialType: SOCIAL_TYPE.KAKAO,
        email: user.email,
        socialUniqueId: '',
        gender: null,
        age: null,
      });
    }

    console.warn('Kakao login: No authorization code or email provided');
    return null;
  } catch (error) {
    // 에러 타입별로 구분하여 로깅
    if (error instanceof Error) {
      console.error('Kakao login failed:', {
        message: error.message,
        stack: error.stack,
        userInfo: {
          hasAuthCode: !!user.authorizationCode,
          hasEmail: !!user.email,
        },
      });
    } else {
      console.error('Kakao login failed with unknown error:', error);
    }

    // NextAuth에게 로그인 실패를 알리기 위해 null 반환
    return null;
  }
}

export const providerHandlers: {
  [key: string]: (user: User) => Promise<TokenData | null>;
} = {
  'apple-login': handleAppleLogin,
  'kakao-login': handleKakaoLogin,
  'preview-login': handlePreviewLogin,
};
