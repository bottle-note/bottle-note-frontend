import CredentialsProvider from 'next-auth/providers/credentials';
import { SOCIAL_TYPE } from '@/types/Auth';

export const appleProvider = CredentialsProvider({
  id: 'apple-login',
  name: 'Apple Login',
  credentials: {
    authorizationCode: { type: 'text' },
    userInfo: { type: 'text' },
    socialUniqueId: { type: 'text' },
  },
  async authorize(credentials) {
    if (
      !credentials?.authorizationCode ||
      !credentials?.userInfo ||
      !credentials?.socialUniqueId
    ) {
      return null;
    }

    try {
      const userInfo = JSON.parse(credentials.userInfo);
      // 백엔드 인증을 위해 전달할 데이터
      const backendApiPayload = {
        provider: SOCIAL_TYPE.APPLE,
        authorizationCode: credentials.authorizationCode,
        // 나머지 데이터들은 실제로 api 호출에 필요한 값인지 체크 바람.
        id: credentials.socialUniqueId,
        email: userInfo.email || 'no-email',
        name: userInfo.name || 'Apple User',
        socialUniqueId: credentials.socialUniqueId,
      };
      return backendApiPayload;
    } catch (error) {
      console.error('Apple 로그인 credential 파싱 에러:', error);
      return null;
    }
  },
});

export const kakaoProvider = CredentialsProvider({
  id: 'kakao-login',
  name: 'Kakao Login',
  credentials: {
    accessToken: { type: 'text' },
    email: { type: 'text' },
    authorizationCode: { type: 'text' },
  },
  async authorize(credentials) {
    if (
      !credentials?.accessToken &&
      !credentials?.email &&
      !credentials?.authorizationCode
    ) {
      return null;
    }

    try {
      const backendApiPayload = {
        provider: SOCIAL_TYPE.KAKAO,
        accessToken: credentials.accessToken,
        authorizationCode: credentials.authorizationCode,
        email: credentials.email,
        id: '',
      };
      return backendApiPayload;
    } catch (error) {
      console.error('Kakao 로그인 credential 파싱 에러:', error);
      return null;
    }
  },
});
