import { useRef } from 'react';
import { AuthApi } from '@/api/auth/auth.api';
import { UserApi } from '@/api/user/user.api';
import { useLoginNavigation } from '@/hooks/useLoginNavigation';
import { DeviceService } from '@/lib/DeviceService';
import { loginAuthSession } from '@/lib/auth/session-store';
import { loadKakaoSDK } from '@/lib/kakao/kakaoSDK';
import useModalStore from '@/store/modalStore';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { handleWebViewMessage, sendLogToFlutter } from '@/utils/flutterUtil';
import { consumeLoginTrigger } from '@/utils/loginTrigger';

type SocialLoginMethod = 'kakao' | 'apple';

const KAKAO_STATE_COOKIE = 'bn_kakao_state';
const KAKAO_COOKIE_OPTIONS = 'Path=/oauth/kakao; SameSite=Lax';

// 로그인 오류를 화면이나 앱 로그에 표시할 문자열로 변환한다.
const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

// 카카오 로그인 요청 확인용 nonce 쿠키를 삭제한다.
const clearKakaoState = () => {
  document.cookie = `${KAKAO_STATE_COOKIE}=; Max-Age=0; ${KAKAO_COOKIE_OPTIONS}`;
};

// 소셜 로그인 시작·콜백·공통 인증 완료와 오류 표시를 담당한다.
export const useSocialLogin = () => {
  const navigation = useLoginNavigation();
  const { handleModalState } = useModalStore();
  const hasHandledKakaoCallback = useRef(false);

  // 로그인 실패 메시지를 공통 모달로 표시한다.
  const showLoginError = (error: unknown) => {
    handleModalState({
      isShowModal: true,
      mainText: '로그인 실패',
      subText: getErrorMessage(error),
    });
  };

  // 카카오 요청 정보를 정리한 뒤 로그인 취소 이동을 요청한다.
  const cancelLogin = () => {
    clearKakaoState();
    navigation.cancelLogin();
  };

  // 앱에서 로그인한 경우 기기 정보를 전송하고, 전송 실패는 앱 로그에 남긴다.
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

  // 로그인 화면 초기화를 요청하고, 인증된 사용자의 복귀 전에 앱 기기 정보를 전송한다.
  const initializeLoginPage = (isLoggedIn: boolean) =>
    navigation.initializeLoginPage(isLoggedIn, sendDeviceInfoIfNeeded);

  // 인증 세션·분석 이벤트·기기 정보를 처리한 뒤 약관 화면 또는 returnTo로 이동한다.
  const completeLogin = async (
    method: SocialLoginMethod,
    payload: Parameters<typeof loginAuthSession>[0],
    returnTo = navigation.getCurrentReturnTo(),
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

    navigation.redirectAfterLogin(result.agreementRequired, returnTo);
    return result;
  };

  // 앱에 카카오 로그인을 요청하거나, 복귀 주소와 nonce를 담아 웹 OAuth를 시작한다.
  const startKakaoLogin = async () => {
    try {
      if (window.isInApp) {
        handleWebViewMessage('loginWithKakao');
        return;
      }

      const isLoaded = await loadKakaoSDK();
      if (!isLoaded) throw new Error('Kakao SDK initialization failed');

      // 복귀 주소는 state로 전달하고, 쿠키에는 요청 확인용 난수만 보관한다.
      const nonce = crypto.randomUUID();
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${KAKAO_STATE_COOKIE}=${nonce}; ${KAKAO_COOKIE_OPTIONS}${secure}`;
      const state = new URLSearchParams({
        returnTo: navigation.getCurrentReturnTo(),
        nonce,
      });

      const errorTo = navigation.getCurrentErrorTo();
      if (errorTo) state.set('errorTo', errorTo);

      window.Kakao.Auth.authorize({
        redirectUri: `${process.env.NEXT_PUBLIC_CLIENT_URL}/oauth/kakao`,
        state: state.toString(),
      });
    } catch (error) {
      clearKakaoState();
      if (!navigation.redirectOnLoginError()) throw error;
    }
  };

  // 서버에서 발급받은 nonce로 앱에 애플 로그인을 요청한다.
  const startAppleLogin = async () => {
    try {
      if (!window.isInApp) return;

      const nonce = await AuthApi.client.getAppleNonce();
      handleWebViewMessage('loginWithApple', { nonce });
    } catch (error) {
      if (!navigation.redirectOnLoginError()) throw error;
    }
  };

  // 웹 카카오 콜백의 중복 처리와 state를 확인한 뒤 인가 코드로 로그인을 완료한다.
  const handleKakaoCallback = async () => {
    if (hasHandledKakaoCallback.current) return;
    hasHandledKakaoCallback.current = true;

    const params = new URLSearchParams(window.location.search);
    const state = new URLSearchParams(params.get('state') ?? '');
    const returnTo = navigation.getCurrentReturnTo();

    try {
      const nonce = state.get('nonce');
      const cookie = document.cookie
        .split('; ')
        .find((value) => value.startsWith(`${KAKAO_STATE_COOKIE}=`));
      if (!nonce || cookie !== `${KAKAO_STATE_COOKIE}=${nonce}`) {
        throw new Error('Invalid Kakao login state');
      }
      clearKakaoState();

      const code = params.get('code');
      if (!code) throw new Error(params.get('error') ?? 'Missing Kakao code');

      await completeLogin(
        'kakao',
        {
          provider: 'kakao-login',
          authorizationCode: code,
        },
        returnTo,
      );
    } catch (error) {
      clearKakaoState();
      console.error(error);
      navigation.redirectOnLoginError(state.get('errorTo'), true);
    }
  };

  // 앱에서 전달받은 카카오 액세스 토큰으로 공통 로그인 완료 처리를 수행한다.
  const onKakaoAppLoginSuccess = async (accessToken: string) => {
    try {
      await completeLogin('kakao', {
        provider: 'kakao-login',
        accessToken,
      });
    } catch (error) {
      if (!navigation.redirectOnLoginError()) showLoginError(error);
    }
  };

  // 앱에서 전달받은 애플 ID 토큰과 nonce로 공통 로그인 완료 처리를 수행한다.
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
      if (!navigation.redirectOnLoginError()) showLoginError(error);
    }
  };

  return {
    startKakaoLogin,
    startAppleLogin,
    handleKakaoCallback,
    onKakaoAppLoginSuccess,
    // 앱 카카오 로그인 실패 시 errorTo로 이동하거나 오류 모달을 표시한다.
    onKakaoAppLoginError: (error: unknown) => {
      if (!navigation.redirectOnLoginError()) showLoginError(error);
    },
    onAppleAppLoginSuccess,
    // 앱 애플 로그인 실패 시 errorTo로 이동하거나 오류 모달을 표시한다.
    onAppleAppLoginError: (error: unknown) => {
      if (!navigation.redirectOnLoginError()) showLoginError(error);
    },
    initializeLoginPage,
    cancelLogin,
  };
};
