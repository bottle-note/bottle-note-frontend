import { act, renderHook } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/api/auth/auth.api';
import { UserApi } from '@/api/user/user.api';
import { ROUTES } from '@/constants/routes';
import { DeviceService } from '@/lib/DeviceService';
import { loadKakaoSDK } from '@/lib/kakao/kakaoSDK';
import { loginAuthSession } from '@/lib/auth/session-store';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { LOGIN_RETURN_TO_KEY, setReturnToUrl } from '@/utils/loginRedirect';
import { consumeLoginTrigger } from '@/utils/loginTrigger';
import { useSocialLogin } from './useSocialLogin';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/api/auth/auth.api', () => ({
  AuthApi: {
    client: {
      getAppleNonce: jest.fn(),
    },
  },
}));

jest.mock('@/api/user/user.api', () => ({
  UserApi: {
    sendDeviceInfo: jest.fn(),
  },
}));

jest.mock('@/lib/kakao/kakaoSDK', () => ({
  loadKakaoSDK: jest.fn(),
}));

jest.mock('@/lib/auth/session-store', () => ({
  loginAuthSession: jest.fn(),
}));

jest.mock('@/utils/analytics/ga4', () => ({
  trackGA4Event: jest.fn(),
}));

jest.mock('@/utils/loginTrigger', () => ({
  consumeLoginTrigger: jest.fn(),
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

describe('useSocialLogin', () => {
  const routerReplace = jest.fn();
  const loginAuthSessionMock = jest.mocked(loginAuthSession);
  const loadKakaoSDKMock = jest.mocked(loadKakaoSDK);
  const getAppleNonceMock = jest.mocked(AuthApi.client.getAppleNonce);
  const sendDeviceInfoMock = jest.mocked(UserApi.sendDeviceInfo);
  const consumeLoginTriggerMock = jest.mocked(consumeLoginTrigger);

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    DeviceService.setIsInApp(false);
    DeviceService.setDeviceToken('');
    DeviceService.setPlatform('');
    window.isInApp = false;
    window.FlutterMessageQueue = {
      postMessage: jest.fn(),
    };
    window.Kakao = {
      Auth: {
        authorize: jest.fn(),
      },
    } as unknown as typeof window.Kakao;
    (useRouter as jest.Mock).mockReturnValue({
      replace: routerReplace,
    });
    consumeLoginTriggerMock.mockReturnValue(null);
    loadKakaoSDKMock.mockResolvedValue(true);
  });

  it('웹 Kakao 로그인이 완료되면 authorization code로 로그인하고 returnTo로 이동한다', async () => {
    loginAuthSessionMock.mockResolvedValueOnce(loginResult(false));
    setReturnToUrl('/explore');
    const { result } = renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.completeKakaoWebLogin('authorization-code');
    });

    expect(loginAuthSessionMock).toHaveBeenCalledWith({
      provider: 'kakao-login',
      authorizationCode: 'authorization-code',
    });
    expect(routerReplace).toHaveBeenCalledTimes(1);
    expect(routerReplace).toHaveBeenCalledWith('/explore');
    expect(sessionStorage.getItem(LOGIN_RETURN_TO_KEY)).toBeNull();
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
    setReturnToUrl('/history');
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
    expect(routerReplace).toHaveBeenCalledWith(ROUTES.AGREEMENTS);
    expect(sessionStorage.getItem(LOGIN_RETURN_TO_KEY)).toBe('/history');
  });

  it('브라우저에서 Kakao 로그인을 시작하면 SDK를 로드하고 authorize를 호출한다', async () => {
    const { result } = renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.startKakaoLogin();
    });

    expect(loadKakaoSDKMock).toHaveBeenCalledTimes(1);
    expect(window.Kakao.Auth.authorize).toHaveBeenCalledWith({
      redirectUri: `${process.env.NEXT_PUBLIC_CLIENT_URL}/oauth/kakao`,
    });
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
    const { result } = renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.completeKakaoWebLogin('authorization-code');
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
