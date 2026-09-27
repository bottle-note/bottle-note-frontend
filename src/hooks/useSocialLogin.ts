import { useCallback } from 'react';
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
  getReturnToFromSearchParams,
  LOGIN_RETURN_TO_PARAM,
  setReturnToUrl,
} from '@/utils/loginRedirect';
import { consumeLoginTrigger } from '@/utils/loginTrigger';

type SocialLoginMethod = 'kakao' | 'apple';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

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

export const useSocialLogin = () => {
  const router = useRouter();
  // WebView 콜백은 이전 화면에서 등록될 수 있어 완료 시점의 URL을 읽는다.
  const getReturnTo = () =>
    getReturnToFromSearchParams(new URLSearchParams(window.location.search));
  const { handleModalState } = useModalStore();

  const showLoginError = (error: unknown) => {
    handleModalState({
      isShowModal: true,
      mainText: '로그인 실패',
      subText: getErrorMessage(error),
    });
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

    const returnTo = getReturnTo();

    if (result.agreementRequired) {
      setReturnToUrl(returnTo);
      router.replace(
        `${ROUTES.AGREEMENTS}?${LOGIN_RETURN_TO_PARAM}=${encodeURIComponent(returnTo)}`,
      );
      return result;
    }

    clearReturnToUrl();
    router.replace(returnTo);
    return result;
  };

  const startKakaoLogin = async () => {
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
  };

  const startAppleLogin = async () => {
    if (!window.isInApp) return;

    const nonce = await AuthApi.client.getAppleNonce();
    handleWebViewMessage('loginWithApple', { nonce });
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
      showLoginError(error);
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
      showLoginError(error);
    }
  };

  const continueAuthenticatedSession = useCallback(
    async (returnTo: string) => {
      await sendDeviceInfoIfNeeded();
      clearReturnToUrl();
      router.replace(returnTo);
    },
    [router],
  );

  return {
    startKakaoLogin,
    startAppleLogin,
    completeKakaoWebLogin,
    onKakaoAppLoginSuccess,
    onKakaoAppLoginError: showLoginError,
    onAppleAppLoginSuccess,
    onAppleAppLoginError: showLoginError,
    continueAuthenticatedSession,
  };
};
