/* eslint-disable no-param-reassign */
import KakaoProvider from 'next-auth/providers/kakao';
import GoogleProvider from 'next-auth/providers/google';
import NaverProvider from 'next-auth/providers/naver';
import NextAuth from 'next-auth';
import { AuthApi } from '../../AuthApi';

const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: `${process.env.KAKAO_CLIENT_ID}`,
      clientSecret: `${process.env.KAKAO_CLIENT_SECRET}`,
    }),
    GoogleProvider({
      clientId: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
    }),
    NaverProvider({
      clientId: `${process.env.NAVER_CLIENT_ID}`,
      clientSecret: `${process.env.NAVER_CLIENT_SECRET}`,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        const body = {
          email: user.email as string,
          gender: null,
          age: null,
          socialType: account?.provider as string,
        };

        const token = await AuthApi.login(body);
        if (account) account.accessToken = token;

        return true;
      } catch {
        return false;
      }
    },

    // 요청시에 이 토큰이 자동으로 쿠키에 박히는지 여부를 확인해야겠다.
    async jwt({ token, account }) {
      if (account && account.accessToken) {
        token.accessToken = account.accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.accessToken = token.accessToken as string;
      return { ...session, token };
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
