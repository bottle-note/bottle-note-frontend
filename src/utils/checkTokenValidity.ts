import { AuthApi } from '@/app/api/AuthApi';
import { AuthService } from '@/lib/AuthService';

export const checkTokenValidity = async (): Promise<boolean> => {
  const token = AuthService.getToken()?.accessToken;

  // 토큰이 없거나 userData 존해하지 않음
  if (!token || !AuthService.userData) return false;

  // 토큰 검증하여 invalid 라는 문구가 없으면 유효 토큰
  const { data: result } = await AuthApi.client.verifyToken(token);
  return !result.includes('invalid');
};
