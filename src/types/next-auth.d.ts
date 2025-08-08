import NextAuth from 'next-auth';
import { SOCIAL_TYPE } from './Auth';

declare module 'next-auth' {
  interface User {
    provider?: SOCIAL_TYPE;
    accessToken?: string;
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

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    userId?: number;
    roles?: string;
  }
}
