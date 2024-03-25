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
    // 로그인이 완료되었을 때 백엔드와 연동 로직 여기에 추가
    async signIn(data) {
      try {
        // TODO:
        // data params 로 받아오는 데이터를 백엔드에 전달
        // 해당 유저에 대한 액세스 토큰 발급 및 저장하여 api 요청시 활용
        // 만약 이렇게 발급받은 액세스 토큰이 만료된 경우에는 어떻게 해야하지?
        // -> 리프레시 토큰을 이용해서 우리 서버의 액세스 토큰 재발급
        // 카카오 서버에서 발급받은 액세스 토큰이 만료된 경우
        // -> 프론트쪽에서 카카오 서버를 통해 갱신 필요
        // 여기서 우리 서버의 액세스토큰과 리프레시토큰을 어떤 전략으로 관리할 것인지 결정 필요
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
