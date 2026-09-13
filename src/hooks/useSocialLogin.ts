import { useRouter } from 'next/navigation';
import { AuthApi } from '@/api/auth/auth.api';
import { UserApi } from '@/api/user/user.api';
import { ROUTES } from '@/constants/routes';
import { DeviceService } from '@/lib/DeviceService';
import { loginAuthSession } from '@/lib/auth/session-store';
import { loadKakaoSDK } from '@/lib/kakao/kakaoSDK';
import useModalStore from '@/store/modalStore';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { handleWebViewMessage, sendLogToFlutter } from '@/utils/flutterUtil';
import {
  clearReturnToUrl,
  getPendingReturnToUrl,
  getReturnToUrl,
  isWhiskeyMbtiReturnUrl,
  normalizeWhiskeyMbtiReturnUrl,
  setReturnToUrl,
  WHISKEY_MBTI_INTRO_PATH,
} from '@/utils/loginRedirect';
import { consumeLoginTrigger } from '@/utils/loginTrigger';

type SocialLoginMethod = 'kakao' | 'apple';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const useSocialLogin = () => {
  const router = useRouter();
  const { handleModalState } = useModalStore();

  const showLoginError = (error: unknown) => {
    handleModalState({
      isShowModal: true,
      mainText: '로그인 실패',
      subText: getErrorMessage(error),
    });
  };

  const cancelMbtiLogin = (returnTo?: string | null) => {
    if (!isWhiskeyMbtiReturnUrl(returnTo ?? getPendingReturnToUrl())) {
      return false;
    }

    clearReturnToUrl();
    consumeLoginTrigger();
    router.replace(WHISKEY_MBTI_INTRO_PATH);
    return true;
  };

  const sendDeviceInfoIfNeeded = async () => {
    if (!DeviceService.isInApp) return;

    try {
      await UserApi.sendDeviceInfo({
        deviceToken: DeviceService.deviceToken || '',
        platform: DeviceService.platform || '',
      });
    } catch (error) {
      sendLogToFlutter(getErrorMessage(error));
    }
  };

  const completeLogin = async (
    method: SocialLoginMethod,
    payload: Parameters<typeof loginAuthSession>[0],
  ) => {
    const result = await loginAuthSession(payload);
    const trigger = consumeLoginTrigger();

    trackGA4Event('login', {
      method,
      trigger: trigger ?? undefined,
    });

    if (trigger) {
      trackGA4Event('login_prompt_converted', { trigger });
    }

    await sendDeviceInfoIfNeeded();

    const returnTo = getReturnToUrl();

    if (result.agreementRequired) {
      setReturnToUrl(normalizeWhiskeyMbtiReturnUrl(returnTo));
      router.replace(ROUTES.AGREEMENTS);
      return result;
    }

    router.replace(returnTo);
    return result;
  };

  const startKakaoLogin = async () => {
    try {
      if (window.isInApp) {
        handleWebViewMessage('loginWithKakao');
        return;
      }

      const isLoaded = await loadKakaoSDK();

      if (!isLoaded) {
        throw new Error('Kakao SDK initialization failed');
      }

      window.Kakao.Auth.authorize({
        redirectUri: `${process.env.NEXT_PUBLIC_CLIENT_URL}/oauth/kakao`,
      });
    } catch (error) {
      if (!cancelMbtiLogin()) throw error;
    }
  };

  const startAppleLogin = async () => {
    try {
      if (!window.isInApp) return;

      const nonce = await AuthApi.client.getAppleNonce();
      handleWebViewMessage('loginWithApple', { nonce });
    } catch (error) {
      if (!cancelMbtiLogin()) throw error;
    }
  };

  const completeKakaoWebLogin = (authorizationCode: string) =>
    completeLogin('kakao', {
      provider: 'kakao-login',
      authorizationCode,
    });

  const onKakaoAppLoginSuccess = async (accessToken: string) => {
    try {
      await completeLogin('kakao', {
        provider: 'kakao-login',
        accessToken,
      });
    } catch (error) {
      if (!cancelMbtiLogin()) showLoginError(error);
    }
  };

  const onAppleAppLoginSuccess = async (data: string) => {
    try {
      const { idToken, nonce } = JSON.parse(data) as {
        idToken: string;
        nonce: string;
      };

      await completeLogin('apple', {
        provider: 'apple-login',
        idToken,
        nonce,
      });
    } catch (error) {
      sendLogToFlutter(`onAppleLoginError:${getErrorMessage(error)}`);
      if (!cancelMbtiLogin()) showLoginError(error);
    }
  };

  const continueAuthenticatedSession = async () => {
    await sendDeviceInfoIfNeeded();
    router.replace(getReturnToUrl());
  };

  return {
    startKakaoLogin,
    startAppleLogin,
    completeKakaoWebLogin,
    onKakaoAppLoginSuccess,
    onKakaoAppLoginError: (error: unknown) => {
      if (!cancelMbtiLogin()) showLoginError(error);
    },
    onAppleAppLoginSuccess,
    onAppleAppLoginError: (error: unknown) => {
      if (!cancelMbtiLogin()) showLoginError(error);
    },
    continueAuthenticatedSession,
    cancelMbtiLogin,
  };
};
