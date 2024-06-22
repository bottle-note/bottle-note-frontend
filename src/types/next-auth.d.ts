import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      name: string;
      email: string;
      accessToken: string;
      refreshToken: string;
      userId: number;
    };
  }
}
