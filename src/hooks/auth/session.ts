import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserData } from '@/types/Auth';

export const getAuth = async () => {
  const session = await getServerSession(authOptions);

  const user = session?.user
    ? ({
        userId: session.user.userId,
        sub: session.user.email,
        profile: session.user.profile,
        roles: session.user.roles,
      } as UserData)
    : null;

  return {
    session,
    user,
    isLoggedIn: !!user,
  };
};
