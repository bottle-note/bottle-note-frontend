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
    async signIn({ user, account }) {
      try {
        const body = {
          email: user.email,
          gender: null,
          age: null,
          socialType: account?.provider,
        };

        const res = await fetch(`${process.env.SERVER_URL}/oauth/login`, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { data } = await res.json();
        console.log(data);

        // TODO:
        // 1. 토큰 저장
        // 2. 토큰 갱신을 어떻게 할 것인지 생각 (모든 요청을 route handler 나 서버쪽에서 담당하면 토큰관리는 어떻게 함? 흠....? 클라이언트에서 해야겠구나...)
        // 3. 응답값 공통 타입 적용

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
