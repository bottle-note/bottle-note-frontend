import { useRouter } from 'next/navigation';
import { sendLogToFlutter } from '@/utils/flutterUtil';
import useModalStore from '@/store/modalStore';
import { useAuth } from './auth/useAuth';

export const useAppSocialLogin = () => {
  const router = useRouter();
  const { handleModalState } = useModalStore();
  const { login } = useAuth();

  const onKakaoLoginError = (error: string) => {
    handleModalState({
      isShowModal: true,
      mainText: '로그인 실패',
      subText: error,
    });
  };

  const onKakaoLoginSuccess = async (accessToken: string) => {
    try {
      await login('kakao-login', {
        accessToken,
      });

      router.replace('/');
    } catch (e) {
      onKakaoLoginError((e as Error).message);
    }
  };

  const onAppleLoginError = (error: string) => {
    handleModalState({
      isShowModal: true,
      mainText: '로그인 실패',
      subText: error,
    });
  };

  const onAppleLoginSuccess = async (data: string) => {
    try {
      const { idToken, nonce } = JSON.parse(data) as {
        idToken: string;
        nonce: string;
      };

      await login(
        'apple-login',
        {
          idToken,
          nonce,
        },
        false,
      );

      router.replace('/');
    } catch (e) {
      sendLogToFlutter(`onAppleLoginError:${(e as Error).message}`);
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
