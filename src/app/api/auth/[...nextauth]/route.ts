import NextAuth from 'next-auth';
import KakaoProvider from 'next-auth/providers/kakao';
import GoogleProvider from 'next-auth/providers/google';
import NaverProvider from 'next-auth/providers/naver';

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
  callbacks: {
    async signIn(data) {
      try {
        // TODO: 백엔드 회원가입/로그인 api 요청 here
        console.log(data);
        return true;
      } catch {
        return false;
      }
    },

    async jwt({ token, user }) {
      return { ...token, ...user };
    },

    async session({ session, token }) {
      return { ...session, user: token };
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
