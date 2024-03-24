import NextAuth from 'next-auth';
import KakaoProvider from 'next-auth/providers/kakao';

const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: `${process.env.KAKAO_CLIENT_ID}`,
      clientSecret: `${process.env.KAKAO_CLIENT_SECRET}`,
    }),
  ],
  callbacks: {
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
