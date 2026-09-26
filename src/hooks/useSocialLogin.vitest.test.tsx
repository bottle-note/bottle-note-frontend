import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/api/auth/auth.api';
import { UserApi } from '@/api/user/user.api';
import { ROUTES } from '@/constants/routes';
import { DeviceService } from '@/lib/DeviceService';
import { loadKakaoSDK } from '@/lib/kakao/kakaoSDK';
import { loginAuthSession } from '@/lib/auth/session-store';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { consumeLoginTrigger } from '@/utils/loginTrigger';
import { useSocialLogin } from './useSocialLogin';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/api/auth/auth.api', () => ({
  AuthApi: {
    client: {
      getAppleNonce: vi.fn(),
    },
  },
}));

vi.mock('@/api/user/user.api', () => ({
  UserApi: {
    sendDeviceInfo: vi.fn(),
  },
}));

vi.mock('@/lib/kakao/kakaoSDK', () => ({
  loadKakaoSDK: vi.fn(),
}));

vi.mock('@/lib/auth/session-store', () => ({
  loginAuthSession: vi.fn(),
}));

vi.mock('@/utils/analytics/ga4', () => ({
  trackGA4Event: vi.fn(),
}));

vi.mock('@/utils/loginTrigger', () => ({
  consumeLoginTrigger: vi.fn(),
}));

const loginResult = (agreementRequired: boolean) => ({
  agreementRequired,
  session: {
    accessToken: 'access-token',
    user: {
      userId: 1,
      sub: 'tester@bottle-note.com',
      profile: null,
      roles: 'ROLE_USER' as const,
    },
  },
});

const prepareKakaoCallback = (returnTo: string) => {
  const state = new URLSearchParams({ returnTo, nonce: 'test-nonce' });
  const params = new URLSearchParams({
    code: 'authorization-code',
    state: state.toString(),
  });
  window.history.replaceState(null, '', `/oauth/kakao?${params.toString()}`);
  document.cookie = 'bn_kakao_state=test-nonce; Path=/oauth/kakao';
};

describe('useSocialLogin', () => {
  const routerReplace = vi.fn();
  const loginAuthSessionMock = vi.mocked(loginAuthSession);
  const loadKakaoSDKMock = vi.mocked(loadKakaoSDK);
  const getAppleNonceMock = vi.mocked(AuthApi.client.getAppleNonce);
  const sendDeviceInfoMock = vi.mocked(UserApi.sendDeviceInfo);
  const consumeLoginTriggerMock = vi.mocked(consumeLoginTrigger);

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    window.history.replaceState(null, '', '/login');
    document.cookie = 'bn_kakao_state=; Max-Age=0; Path=/oauth/kakao';
    DeviceService.setIsInApp(false);
    DeviceService.setDeviceToken('');
    DeviceService.setPlatform('');
    window.isInApp = false;
    window.FlutterMessageQueue = {
      postMessage: vi.fn(),
    };
    window.Kakao = {
      Auth: {
        authorize: vi.fn(),
      },
    } as unknown as typeof window.Kakao;
    (useRouter as Mock).mockReturnValue({
      replace: routerReplace,
    });
    consumeLoginTriggerMock.mockReturnValue(null);
    loadKakaoSDKMock.mockResolvedValue(true);
  });

  it('웹 Kakao 로그인이 완료되면 authorization code로 로그인하고 returnTo로 이동한다', async () => {
    loginAuthSessionMock.mockResolvedValueOnce(loginResult(false));
    prepareKakaoCallback('/explore');
    const { result } = renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.handleKakaoCallback();
    });

    expect(loginAuthSessionMock).toHaveBeenCalledWith({
      provider: 'kakao-login',
      authorizationCode: 'authorization-code',
    });
    expect(routerReplace).toHaveBeenCalledTimes(1);
    expect(routerReplace).toHaveBeenCalledWith('/explore');
  });

  it('필수 동의가 필요하면 agreements로 이동하고 returnTo를 유지한다', async () => {
    loginAuthSessionMock.mockResolvedValueOnce(loginResult(true));
    sendDeviceInfoMock.mockResolvedValueOnce({
      success: true,
      code: 200,
      errors: [],
      data: {
        message: 'saved',
        deviceToken: 'device-token',
        platform: 'ios',
      },
      meta: {
        serverEncoding: 'UTF-8',
        serverVersion: 'test',
        serverPathVersion: 'v1',
        serverResponseTime: '2026-08-03T00:00:00',
      },
    });
    DeviceService.setIsInApp(true);
    DeviceService.setDeviceToken('device-token');
    DeviceService.setPlatform('ios');
    window.isInApp = true;
    window.history.replaceState(null, '', '/login?returnTo=%2Fhistory');
    const { result } = renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.onKakaoAppLoginSuccess('kakao-access-token');
    });

    expect(loginAuthSessionMock).toHaveBeenCalledWith({
      provider: 'kakao-login',
      accessToken: 'kakao-access-token',
    });
    expect(sendDeviceInfoMock).toHaveBeenCalledWith({
      deviceToken: 'device-token',
      platform: 'ios',
    });
    expect(routerReplace).toHaveBeenCalledTimes(1);
    expect(routerReplace).toHaveBeenCalledWith(
      `${ROUTES.AGREEMENTS}?returnTo=%2Fhistory`,
    );
  });

  it('MBTI에서 약관 동의가 필요하면 결과 주소를 유지한다', async () => {
    loginAuthSessionMock.mockResolvedValueOnce(loginResult(true));
    prepareKakaoCallback('/whiskey-mbti?result=INTJ-A');
    const { result } = renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.handleKakaoCallback();
    });

    expect(routerReplace).toHaveBeenCalledWith(
      `${ROUTES.AGREEMENTS}?returnTo=%2Fwhiskey-mbti%3Fresult%3DINTJ-A`,
    );
  });

  it('MBTI 앱 로그인 오류는 첫 화면으로 돌아가고 실패 모달을 열지 않는다', () => {
    window.history.replaceState(
      null,
      '',
      '/login?returnTo=%2Fwhiskey-mbti%3Fresult%3DINTJ-A&errorTo=%2Fwhiskey-mbti',
    );
    const { result } = renderHook(() => useSocialLogin());

    act(() => {
      result.current.onKakaoAppLoginError(new Error('cancelled'));
    });

    expect(routerReplace).toHaveBeenCalledWith('/whiskey-mbti');
  });

  it('브라우저에서 Kakao 로그인을 시작하면 SDK를 로드하고 authorize를 호출한다', async () => {
    const { result } = renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.startKakaoLogin();
    });

    expect(loadKakaoSDKMock).toHaveBeenCalledTimes(1);
    expect(window.Kakao.Auth.authorize).toHaveBeenCalledWith(
      expect.objectContaining({
        redirectUri: `${process.env.NEXT_PUBLIC_CLIENT_URL}/oauth/kakao`,
        state: expect.any(String),
      }),
    );
  });

  it('인앱에서 Kakao 로그인을 시작하면 Flutter에 로그인을 요청한다', async () => {
    DeviceService.setIsInApp(true);
    window.isInApp = true;
    const { result } = renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.startKakaoLogin();
    });

    expect(window.FlutterMessageQueue.postMessage).toHaveBeenCalledWith(
      'loginWithKakao',
      undefined,
    );
    expect(loadKakaoSDKMock).not.toHaveBeenCalled();
  });

  it('Apple 로그인을 시작하면 nonce를 발급받아 Flutter에 전달한다', async () => {
    DeviceService.setIsInApp(true);
    window.isInApp = true;
    getAppleNonceMock.mockResolvedValueOnce('apple-nonce');
    const { result } = renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.startAppleLogin();
    });

    expect(window.FlutterMessageQueue.postMessage).toHaveBeenCalledWith(
      'loginWithApple',
      { nonce: 'apple-nonce' },
    );
  });

  it('로그인이 완료되면 로그인 분석 이벤트를 기록한다', async () => {
    loginAuthSessionMock.mockResolvedValueOnce(loginResult(false));
    consumeLoginTriggerMock.mockReturnValueOnce('review_write');
    prepareKakaoCallback('/');
    const { result } = renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.handleKakaoCallback();
    });

    expect(trackGA4Event).toHaveBeenCalledWith('login', {
      method: 'kakao',
      trigger: 'review_write',
    });
    expect(trackGA4Event).toHaveBeenCalledWith('login_prompt_converted', {
      trigger: 'review_write',
    });
  });
});
