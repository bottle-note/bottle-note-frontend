import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { decodeJwt } from 'jose';
import { SOCIAL_TYPE, UserData } from '@/types/Auth';
import { providerHandlers } from '@/lib/auth/handler';

const handler = NextAuth({
  debug: true,
  providers: [
    CredentialsProvider({
      id: 'apple-login',
      name: 'Apple Login',
      // signIn 호출시 전달되는 데이터 타입 정의
      credentials: {
        authroizationCode: { type: 'text' }, // 애플 로그인 인증 코드 (필수)
        userInfo: { type: 'text' }, // 애플 로그인 사용자 정보 (옵션)
        socialUniqueId: { type: 'text' }, // 애플 로그인 고유 아이디 (옵션)
      },
      // 클라이언트에서 signIn 호출시 실행되는 함수
      // 매개변수 credentials 는 클라이언트에서 signIn 호출시에 전달한 데이터
      async authorize(credentials) {
        if (
          credentials?.authroizationCode &&
          credentials?.userInfo &&
          credentials?.socialUniqueId
        ) {
          try {
            const userInfo = JSON.parse(credentials.userInfo);
            // 보틀노트 서비스 BE 에 전달할 로그인 데이터
            const body = {
              provider: SOCIAL_TYPE.APPLE, // 필수
              authroizationCode: credentials.authroizationCode, // 필수
              id: credentials.socialUniqueId, // 이하 나머지 api 문서 체크해 확인 필요
              email: userInfo.email || 'no-email',
              name: userInfo.name || 'Apple User',
              socialUniqueId: credentials.socialUniqueId,
            };
            return body;
          } catch (error) {
            console.error('Apple login credentials parsing error:', error);
            return null;
          }
        }
        return null;
      },
    }),
    CredentialsProvider({
      id: 'kakao-login',
      name: 'Kakao Login',
      credentials: {
        accessToken: { type: 'text' }, // 앱을 통해 받아올 데이터 (수정 예정)
        email: { type: 'text' }, // 앱을 통해 받아올 데이터 (기존)
        authroizationCode: { type: 'text' }, // 웹 sdk 로그인
      },
      async authorize(credentials) {
        if (
          credentials?.accessToken ||
          credentials?.email ||
          credentials?.authroizationCode
        ) {
          try {
            const body = {
              provider: SOCIAL_TYPE.KAKAO,
              accessToken: credentials.accessToken,
              authroizationCode: credentials.authroizationCode,
              email: credentials.email,
              id: '',
            };

            return body;
          } catch (error) {
            console.error('Kakao login credentials parsing error:', error);
            return null;
          }
        }
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // user : 위 authorize 에서 반환한 데이터
    // account : provider, type 데이터
    // credentials : 클라이언트가 signin 호출시에 전달한 데이터
    async signIn({ account, credentials }) {
      if (
        account?.provider === 'apple-login' &&
        credentials?.authroizationCode
      ) {
        return true;
      }

      if (
        account?.provider === 'kakao-login' &&
        (credentials?.accessToken ||
          credentials?.email ||
          credentials?.authroizationCode)
      ) {
        return true;
      }

      return false;
    },

    // token : jwt 토큰 객체, 이 객체를 수정해서 return 하면 세션에 반영.
    // user : 최초 로그인시 사용되는 사용자 정보, authorize 에서 반환한 데이터.
    // account: provider 와 type 정보, 최초 로그인 시에만 조회 가능
    async jwt({ token, user, account }) {
      // 최초 로그인 시
      if (user && account) {
        try {
          const handler = providerHandlers[account.provider];
          if (!handler) {
            throw new Error(
              `No handler found for provider: ${account.provider}`,
            );
          }

          const tokens = await handler(user);

          if (tokens && tokens.accessToken) {
            const info = decodeJwt(tokens.accessToken) as UserData;
            return {
              ...token,
              email: info.sub,
              roles: info.roles,
              userId: info.userId,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            };
          }

          return { ...token, error: 'AuthenticationFailed' };
        } catch (error) {
          console.error(
            `JWT callback error for provider ${account.provider}:`,
            error,
          );
          return { ...token, error: 'AuthenticationFailed' };
        }
      }

      return token;
    },

    async session({ session, token }) {
      const { accessToken, refreshToken, userId, roles, email } = token;
      session.user = {
        ...session.user,
        ...{
          accessToken: accessToken as string,
          refreshToken: refreshToken as string,
          userId: userId as number,
          roles: roles as string,
          email: email as string,
        },
      };

      return session;
    },
    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
