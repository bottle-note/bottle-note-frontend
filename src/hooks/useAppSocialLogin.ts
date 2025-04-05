import { useRouter } from 'next/navigation';
import { AuthApi } from '@/app/api/AuthApi';
import { AuthService } from '@/lib/AuthService';
import { SOCIAL_TYPE } from '@/types/Auth';
import { sendLogToFlutter } from '@/utils/flutterUtil';

export const useAppSocialLogin = () => {
  const router = useRouter();

  const onKakaoLoginError = (error: string) => {
    console.error(`❌ 카카오 로그인 실패: ${error}`);
    // TODO: 오류 메시지 표시 및 처리
  };

  const onKakaoLoginSuccess = async (email: string) => {
    const loginResult = await AuthApi.clientLogin({
      email,
      socialType: SOCIAL_TYPE.KAKAO,
    });

    AuthService.login(loginResult.info, loginResult.tokens);

    router.replace('/');
  };

  const onAppleLoginError = (error: string) => {
    console.error(`❌ 애플 로그인 실패: ${error}`);
    sendLogToFlutter(error);
    // TODO: 에러 메시지를 받아와서 모달을 띄워주는 액션 필요
    // 로그인 설계에서 에러 바운더리를 지역적으로 시범적용, 글로벌로 점차 퍼져나가도록 설계 변경 필요해보임.
    // fsd 형식으로 전체 설계를 바꿔버릴까?
  };

  const onAppleLoginSuccess = async (data: string) => {
    try {
      sendLogToFlutter(`data : ${data}, ${typeof data}`);

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
    } catch (e) {
      onAppleLoginError((e as Error).message);
    }
  };

  return {
    onKakaoLoginSuccess,
    onKakaoLoginError,
    onAppleLoginSuccess,
    onAppleLoginError,
  };
};
