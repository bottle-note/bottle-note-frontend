import { useRouter } from 'next/navigation';
import { AuthApi } from '@/app/api/AuthApi';
import { AuthService } from '@/lib/AuthService';
import { SOCIAL_TYPE } from '@/types/Auth';
import { sendLogToFlutter } from '@/utils/flutterUtil';

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
    // 여기서 정보가 제대로 오지 않았을 경우 실패 처리 필요
    const { email, id } = JSON.parse(data) as {
      email: string | null;
      id: string;
    };

    sendLogToFlutter(`email:${email}, id:${id}`);

    const loginResult = await AuthApi.clientLogin({
      email: email ?? '',
      socialUniqueId: id,
      socialType: SOCIAL_TYPE.APPLE,
    });

    sendLogToFlutter(`loginResult:${JSON.stringify(loginResult)}`);

    AuthService.login(loginResult.info, loginResult.tokens);

    router.replace('/');
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
