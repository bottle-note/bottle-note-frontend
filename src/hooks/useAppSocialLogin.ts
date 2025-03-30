import { useRouter } from 'next/navigation';
import { AuthApi } from '@/app/api/AuthApi';
import { AuthService } from '@/lib/AuthService';
import { SOCIAL_TYPE } from '@/types/Auth';

export const useAppSocialLogin = () => {
  const router = useRouter();
  const onKakaoLoginSuccess = async (email: string) => {
    const loginResult = await AuthApi.clientLogin({
      email,
      socialType: SOCIAL_TYPE.KAKAO,
    });

    AuthService.login(loginResult.info, loginResult.tokens);

    router.replace('/');
  };

  const onKakaoLoginError = (error: string) => {
    console.error(`❌ 카카오 로그인 실패: ${error}`);
    // TODO: 오류 메시지 표시 및 처리
  };

  const onAppleLoginSuccess = async (data: string) => {
    console.log(`애플 로그인 성공: ${data}`);
  };

  const onAppleLoginError = (error: string) => {
    console.error(`❌ 애플 로그인 실패: ${error}`);
    // TODO: 오류 메시지 표시 및 처리
  };

  return {
    onKakaoLoginSuccess,
    onKakaoLoginError,
    onAppleLoginSuccess,
    onAppleLoginError,
  };
};
