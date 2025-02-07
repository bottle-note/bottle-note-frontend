import { UserApi } from '@/app/api/UserApi';
import { AuthService } from '@/lib/AuthService';

// TODO: Token verification api 적용
export const checkTokenValidity = async (): Promise<boolean> => {
  const { userData } = AuthService;

  if (!userData) return false;

  const userInfoResponse = await UserApi.getUserInfoWithAuth({
    userId: `${userData.userId}`,
  });

  return userInfoResponse.isMyPage;
};
