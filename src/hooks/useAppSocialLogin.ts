import { useRouter } from 'next/navigation';
import { AuthApi } from '@/app/api/AuthApi';
import { sendLogToFlutter } from '@/utils/flutterUtil';
import useModalStore from '@/store/modalStore';
import { SOCIAL_TYPE } from '@/types/Auth';
import { signIn } from 'next-auth/react';

export const useAppSocialLogin = () => {
  const router = useRouter();
  const { handleModalState } = useModalStore();

  const onKakaoLoginError = (error: string) => {
    handleModalState({
      isShowModal: true,
      type: 'ALERT',
      mainText: '로그인 실패',
      subText: error,
    });
  };

  const onKakaoLoginSuccess = async (email: string) => {
    try {
      const loginResult = await AuthApi.client.login({
        email,
        socialType: SOCIAL_TYPE.KAKAO,
      });

      await signIn('credentials', {
        redirect: false,
        ...loginResult.tokens,
      });

      router.replace('/');
    } catch (e) {
      onKakaoLoginError((e as Error).message);
    }
  };

  const onAppleLoginError = (error: string) => {
    handleModalState({
      isShowModal: true,
      type: 'ALERT',
      mainText: '로그인 실패',
      subText: error,
    });
  };

  const onAppleLoginSuccess = async (data: string) => {
    try {
      const { email, id } = JSON.parse(data) as {
        email: string | null;
        id: string;
      };

      const loginResult = await AuthApi.client.login({
        email: email ?? '',
        socialUniqueId: id,
        socialType: SOCIAL_TYPE.APPLE,
      });

      await signIn('credentials', {
        redirect: false,
        ...loginResult.tokens,
      });

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
