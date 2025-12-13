import { useRouter } from 'next/navigation';
import { sendLogToFlutter } from '@/utils/flutterUtil';
import useModalStore from '@/store/modalStore';
import { useAuth } from './auth/useAuth';

const RETURN_TO_KEY = 'login_return_to';

const getReturnToUrl = () => {
  const returnTo = sessionStorage.getItem(RETURN_TO_KEY) || '/';
  sessionStorage.removeItem(RETURN_TO_KEY);
  return returnTo;
};

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

  const onKakaoLoginSuccess = async (payload: string) => {
    try {
      if (payload.includes('@')) {
        await login('kakao-login', {
          email: payload,
        });
      } else {
        await login('kakao-login', {
          accessToken: payload,
        });
      }
      router.replace(getReturnToUrl());
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

      router.replace(getReturnToUrl());
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
