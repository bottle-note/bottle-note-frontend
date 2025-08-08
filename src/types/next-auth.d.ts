import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    provider: SOCIAL_TYPE;
    authroizationCode?: string;
    socialUniqueId?: string;
  }

  interface Session {
    user: {
      name: string;
      email: string;
      accessToken: string;
      refreshToken: string;
      userId: number;
      profile: string | null;
    };
  }
}
