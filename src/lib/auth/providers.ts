import CredentialsProvider from 'next-auth/providers/credentials';
import { SOCIAL_TYPE } from '@/types/Auth';

export const appleProvider = CredentialsProvider({
  id: 'apple-login',
  name: 'Apple Login',
  credentials: {
    idToken: { type: 'text' },
  },
  async authorize(credentials) {
    if (!credentials?.idToken) {
      return null;
    }

    try {
      // 백엔드 인증을 위해 전달할 데이터
      const backendApiPayload = {
        provider: SOCIAL_TYPE.APPLE,
        idToken: credentials.idToken,
        id: '',
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
