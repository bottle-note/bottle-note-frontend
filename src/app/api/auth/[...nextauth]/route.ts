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

        const { accessToken, refreshToken } = await AuthApi.login(body);

        if (account) {
          account.accessToken = accessToken;
          account.refreshToken = refreshToken;
        }

        return true;
      } catch (error) {
        console.error('Error :', error);
        return true;
      }
    },

    async jwt({ token, account }) {
      if (account && account.accessToken) {
        token.accessToken = account.accessToken;
        token.refreshToken = account.refreshToken;
      }

      return token;
    },

    async session({ session, token }) {
      const { accessToken, refreshToken } = token;
      session.user.token = {
        accessToken: accessToken as string,
        refreshToken: refreshToken as string,
      };

      return { ...session, token };
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
