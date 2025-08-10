import { NextAuthOptions } from 'next-auth';
import { decodeJwt } from 'jose';
import { UserData } from '@/types/Auth';
import { appleProvider, kakaoProvider } from '@/lib/auth/providers';
import { providerHandlers } from '@/lib/auth/handler';

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [appleProvider, kakaoProvider],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ account, credentials }) {
      const provider = account?.provider;

      if (provider === 'apple-login') {
        return !!credentials?.authorizationCode;
      }

      if (provider === 'kakao-login') {
        return !!(
          credentials?.accessToken ||
          credentials?.email ||
          credentials?.authorizationCode
        );
      }

      if (provider === 'app-login') {
        return !!(credentials?.accessToken && credentials?.refreshToken);
      }

      return false;
    },

    async jwt({ token, user, account }) {
      // 최초 소셜 로그인 시, 백엔드에 로그인을 요청하고 JWT 토큰을 받아 저장합니다.
      if (user && account) {
        try {
          const handler = providerHandlers[account.provider];
          if (!handler) {
            throw new Error(
              `해당 프로바이더에 대한 핸들러를 찾을 수 없습니다: ${account.provider}`,
            );
          }

          const tokens = await handler(user);

          if (!tokens?.accessToken) {
            return { ...token, error: 'AuthenticationFailed' };
          }

          const userInfo = decodeJwt(tokens.accessToken) as UserData;
          return {
            ...token,
            email: userInfo.sub,
            roles: userInfo.roles,
            userId: userInfo.userId,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          };
        } catch (error) {
          console.error(
            `JWT 콜백 에러 (프로바이더: ${account.provider}):`,
            error,
          );
          return { ...token, error: 'AuthenticationFailed' };
        }
      }

      return token;
    },

    async session({ session, token }) {
      const newSession = {
        ...session,
        user: {
          ...session.user,
          accessToken: token.accessToken as string,
          refreshToken: token.refreshToken as string,
          userId: token.userId as number,
          roles: token.roles as string,
          email: token.email as string,
        },
      };

      return newSession;
    },
    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
  },
};
