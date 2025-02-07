import { AuthApi } from '@/app/api/AuthApi';
import { AuthService } from '@/lib/AuthService';

export const checkTokenValidity = async (): Promise<boolean> => {
  const { userData, getToken } = AuthService;
  const token = getToken()?.accessToken;

  if (!userData || !token) return false;

  const { data: result } = await AuthApi.verifyToken(token);

  if (result.includes('invalid')) return false;

  return true;
};
