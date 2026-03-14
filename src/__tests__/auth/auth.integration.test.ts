import React, { PropsWithChildren } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { useAuth } from '@/hooks/auth/useAuth';
import { apiClient } from '@/shared/api/apiClient';
import useModalStore from '@/store/modalStore';
import {
  getAuthSnapshot,
  resetAuthSessionForTest,
  setAuthenticatedSession,
} from '@/lib/auth/session-store';
import { useAuthInitializer } from '@/hooks/useAuthInitializer';
import { useAppSocialLogin } from '@/hooks/useAppSocialLogin';
import OauthKakaoCallbackPage from '@/app/(custom)/oauth/kakao/page';
import LoginPage from '@/app/(custom)/login/page';
import { DeviceService } from '@/lib/DeviceService';
import { setReturnToUrl } from '@/utils/loginRedirect';
import SettingsPage from '@/app/(primary)/settings/page';
import Modal from '@/components/ui/Modal/Modal';
import { useSettingsStore } from '@/store/settingsStore';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

const sessionPayload = {
  accessToken: 'access-token',
  user: {
    userId: 1,
    sub: 'tester@bottle-note.com',
    profile: null,
    roles: 'ROLE_USER' as const,
  },
};

const refreshedSessionPayload = {
  ...sessionPayload,
  accessToken: 'refreshed-access-token',
};

const createJsonResponse = (body: unknown, init?: { status?: number }) =>
  ({
    ok: (init?.status ?? 200) >= 200 && (init?.status ?? 200) < 300,
    status: init?.status ?? 200,
    json: async () => body,
  }) as Response;

const wrapper = ({ children }: PropsWithChildren) =>
  React.createElement(AuthProvider, null, children);

function HomeRegressionHarness() {
  useAuthInitializer();

  return React.createElement('div', null, 'home-screen');
}

describe('Auth integration', () => {
  const fetchMock = jest.fn();
  let consoleErrorSpy: jest.SpyInstance;
  const routerReplace = jest.fn();
  const routerPush = jest.fn();

  beforeAll(() => {
    global.fetch = fetchMock as typeof fetch;
  });

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockReset();
    routerReplace.mockReset();
    routerPush.mockReset();
    resetAuthSessionForTest();
    sessionStorage.clear();
    localStorage.clear();
    useSettingsStore.setState({ currentScreen: 'main' });
    DeviceService.setIsInApp(false);
    DeviceService.setDeviceToken('');
    DeviceService.setPlatform('');
    (window as typeof window & { isInApp?: boolean }).isInApp = false;
    Object.defineProperty(window, 'scrollTo', {
      writable: true,
      value: jest.fn(),
    });
    document.body.innerHTML = '<div id="modal"></div>';
    (
      window as typeof window & {
        FlutterMessageQueue?: { postMessage: jest.Mock };
        LogToFlutter?: { postMessage: jest.Mock };
        sendLogToFlutter?: jest.Mock;
      }
    ).FlutterMessageQueue = {
      postMessage: jest.fn(),
    };
    (
      window as typeof window & {
        LogToFlutter?: { postMessage: jest.Mock };
      }
    ).LogToFlutter = {
      postMessage: jest.fn(),
    };
    (
      window as typeof window & {
        sendLogToFlutter?: jest.Mock;
      }
    ).sendLogToFlutter = jest.fn();
    useModalStore.setState({
      state: {
        isShowModal: false,
        type: 'ALERT',
        mainText: '',
        subText: '',
        alertBtnName: '확인',
        confirmBtnName: '예',
        cancelBtnName: '아니요',
        handleCancel: null,
        handleConfirm: null,
      },
      loginState: {
        isShowLoginModal: false,
      },
    });
    (useRouter as jest.Mock).mockReturnValue({
      replace: routerReplace,
      push: routerPush,
      back: jest.fn(),
    });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (usePathname as jest.Mock).mockReturnValue('/login');
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('session bootstrap', () => {
    it('앱 시작 시 refresh cookie가 유효하면 authenticated 상태가 된다', async () => {
      fetchMock.mockResolvedValueOnce(createJsonResponse(sessionPayload));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLoggedIn).toBe(true);
      expect(result.current.user).toEqual(sessionPayload.user);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/session',
        expect.objectContaining({
          credentials: 'same-origin',
        }),
      );
    });

    it('앱 시작 시 refresh cookie가 없으면 unauthenticated 상태가 된다', async () => {
      fetchMock.mockResolvedValueOnce(
        createJsonResponse({ message: 'No refresh token' }, { status: 401 }),
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLoggedIn).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('초기 loading 상태에서 인증이 필요한 API 호출이 발생하면 세션 복원이 완료된 뒤 요청한다', async () => {
      fetchMock
        .mockResolvedValueOnce(createJsonResponse(sessionPayload))
        .mockResolvedValueOnce(createJsonResponse({ data: 'ok' }));

      const result = await apiClient.get<{ data: string }>('/secure-endpoint');

      expect(result).toEqual({ data: 'ok' });
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        '/api/auth/session',
        expect.objectContaining({
          credentials: 'same-origin',
        }),
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        '/bottle-api/v1/secure-endpoint',
        expect.objectContaining({
          method: 'GET',
        }),
      );

      const headers = fetchMock.mock.calls[1]?.[1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer access-token');
    });
  });

  describe('protected api behavior', () => {
    it('세션이 없는 상태에서 인증이 필요한 기능을 실행하면 로그인 모달이 노출된다', async () => {
      fetchMock.mockResolvedValueOnce(
        createJsonResponse({ message: 'No refresh token' }, { status: 401 }),
      );

      await expect(apiClient.get('/secure-endpoint')).rejects.toThrow(
        'Authentication required',
      );

      expect(useModalStore.getState().loginState.isShowLoginModal).toBe(true);
    });

    it('공개 API 요청은 세션 상태와 무관하게 실행된다', async () => {
      fetchMock.mockResolvedValueOnce(createJsonResponse({ data: 'public' }));

      const result = await apiClient.get<{ data: string }>('/public-endpoint', {
        authRequired: false,
      });

      expect(result).toEqual({ data: 'public' });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        '/bottle-api/v1/public-endpoint',
        expect.objectContaining({
          method: 'GET',
        }),
      );
    });
  });

  describe('login flows', () => {
    it('카카오 앱 로그인 성공 시 authenticated 상태가 된다', async () => {
      fetchMock.mockResolvedValueOnce(createJsonResponse(sessionPayload));

      const { result } = renderHook(() => useAppSocialLogin());

      await act(async () => {
        await result.current.onKakaoLoginSuccess('kakao-access-token');
      });

      expect(getAuthSnapshot().status).toBe('authenticated');
    });

    it('카카오 앱 로그인 성공 시 returnTo 경로로 이동한다', async () => {
      fetchMock.mockResolvedValueOnce(createJsonResponse(sessionPayload));
      setReturnToUrl('/explore');

      const { result } = renderHook(() => useAppSocialLogin());

      await act(async () => {
        await result.current.onKakaoLoginSuccess('kakao-access-token');
      });

      expect(routerReplace).toHaveBeenCalledWith('/explore');
    });

    it('카카오 웹 로그인 callback 페이지는 authorizationCode로 로그인 요청을 보낸다', async () => {
      fetchMock.mockResolvedValueOnce(createJsonResponse(sessionPayload));
      (useSearchParams as jest.Mock).mockReturnValue(
        new URLSearchParams('code=oauth-code'),
      );
      setReturnToUrl('/history');

      render(React.createElement(OauthKakaoCallbackPage));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalled();
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            provider: 'kakao-login',
            authorizationCode: 'oauth-code',
          }),
        }),
      );
    });

    it('카카오 웹 로그인 성공 시 returnTo 경로로 이동한다', async () => {
      fetchMock.mockResolvedValueOnce(createJsonResponse(sessionPayload));
      (useSearchParams as jest.Mock).mockReturnValue(
        new URLSearchParams('code=oauth-code'),
      );
      setReturnToUrl('/history');

      render(React.createElement(OauthKakaoCallbackPage));

      await waitFor(() => {
        expect(routerReplace).toHaveBeenCalledWith('/history');
      });
    });

    it('애플 로그인 성공 시 authenticated 상태가 된다', async () => {
      fetchMock.mockResolvedValueOnce(createJsonResponse(sessionPayload));

      const { result } = renderHook(() => useAppSocialLogin());

      await act(async () => {
        await result.current.onAppleLoginSuccess(
          JSON.stringify({
            idToken: 'apple-id-token',
            nonce: 'apple-nonce',
          }),
        );
      });

      expect(getAuthSnapshot().status).toBe('authenticated');
    });

    it('애플 로그인 성공 시 returnTo 경로로 이동한다', async () => {
      fetchMock.mockResolvedValueOnce(createJsonResponse(sessionPayload));
      setReturnToUrl('/settings');

      const { result } = renderHook(() => useAppSocialLogin());

      await act(async () => {
        await result.current.onAppleLoginSuccess(
          JSON.stringify({
            idToken: 'apple-id-token',
            nonce: 'apple-nonce',
          }),
        );
      });

      expect(routerReplace).toHaveBeenCalledWith('/settings');
    });

    it('로그인 실패 시 세션은 authenticated 상태가 되지 않는다', async () => {
      fetchMock.mockResolvedValueOnce(
        createJsonResponse({ message: 'Login failed' }, { status: 400 }),
      );

      const { result } = renderHook(() => useAppSocialLogin());

      await act(async () => {
        await result.current.onKakaoLoginSuccess('kakao-access-token');
      });

      expect(getAuthSnapshot().status).not.toBe('authenticated');
    });

    it('로그인 실패 시 실패 핸들러가 호출된다', async () => {
      fetchMock.mockResolvedValueOnce(
        createJsonResponse({ message: 'Login failed' }, { status: 400 }),
      );

      const { result } = renderHook(() => useAppSocialLogin());

      await act(async () => {
        await result.current.onKakaoLoginSuccess('kakao-access-token');
      });

      expect(useModalStore.getState().state.mainText).toBe('로그인 실패');
    });
  });

  describe('home regression guard', () => {
    it('홈 진입 시 세션 복원 실패 후에도 화면이 유지된다', async () => {
      fetchMock.mockResolvedValueOnce(
        createJsonResponse({ message: 'No refresh token' }, { status: 401 }),
      );

      render(React.createElement(HomeRegressionHarness), { wrapper });

      await waitFor(() => {
        expect(screen.getByText('home-screen')).toBeInTheDocument();
      });

      expect(useModalStore.getState().loginState.isShowLoginModal).toBe(false);
    });
  });

  describe('token refresh', () => {
    it('인증이 필요한 API 호출이 403을 반환하면 refresh 후 원래 요청을 1회 재시도한다', async () => {
      fetchMock
        .mockResolvedValueOnce(createJsonResponse(sessionPayload))
        .mockResolvedValueOnce(
          createJsonResponse(
            { code: 403, message: 'expired token' },
            { status: 403 },
          ),
        )
        .mockResolvedValueOnce(createJsonResponse(refreshedSessionPayload))
        .mockResolvedValueOnce(createJsonResponse({ data: 'ok' }));

      const result = await apiClient.get<{ data: string }>('/secure-endpoint');

      expect(result).toEqual({ data: 'ok' });
      expect(fetchMock).toHaveBeenCalledTimes(4);

      const retriedHeaders = fetchMock.mock.calls[3]?.[1]?.headers as Headers;
      expect(retriedHeaders.get('Authorization')).toBe(
        'Bearer refreshed-access-token',
      );
    });

    it('refresh가 실패하면 세션은 unauthenticated 상태가 된다', async () => {
      fetchMock
        .mockResolvedValueOnce(createJsonResponse(sessionPayload))
        .mockResolvedValueOnce(
          createJsonResponse(
            { code: 403, message: 'expired token' },
            { status: 403 },
          ),
        )
        .mockResolvedValueOnce(
          createJsonResponse({ message: 'refresh failed' }, { status: 401 }),
        );

      await expect(apiClient.get('/secure-endpoint')).rejects.toThrow(
        'Token refresh failed',
      );

      expect(getAuthSnapshot().status).toBe('unauthenticated');
    });

    it('refresh가 실패하면 원래 요청을 무한 재시도하지 않는다', async () => {
      fetchMock
        .mockResolvedValueOnce(createJsonResponse(sessionPayload))
        .mockResolvedValueOnce(
          createJsonResponse(
            { code: 403, message: 'expired token' },
            { status: 403 },
          ),
        )
        .mockResolvedValueOnce(
          createJsonResponse({ message: 'refresh failed' }, { status: 401 }),
        );

      await expect(apiClient.get('/secure-endpoint')).rejects.toThrow(
        'Token refresh failed',
      );

      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('logout', () => {
    it('로그아웃 시 refresh cookie 삭제 요청이 수행된다', async () => {
      fetchMock.mockResolvedValueOnce(createJsonResponse(sessionPayload));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoggedIn).toBe(true);
      });

      fetchMock.mockResolvedValueOnce(createJsonResponse({ ok: true }));

      await result.current.logout();

      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/auth/logout',
        expect.objectContaining({
          method: 'POST',
          credentials: 'same-origin',
        }),
      );
    });

    it('로그아웃 시 unauthenticated 상태가 된다', async () => {
      fetchMock.mockResolvedValueOnce(createJsonResponse(sessionPayload));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoggedIn).toBe(true);
      });

      fetchMock.mockResolvedValueOnce(createJsonResponse({ ok: true }));

      await result.current.logout();

      await waitFor(() => {
        expect(result.current.isLoggedIn).toBe(false);
      });

      expect(getAuthSnapshot().status).toBe('unauthenticated');
    });

    it('로그아웃 시 홈으로 이동한다', async () => {
      setAuthenticatedSession(sessionPayload);
      fetchMock
        .mockResolvedValueOnce(
          createJsonResponse({
            errors: [],
            data: false,
          }),
        )
        .mockResolvedValueOnce(createJsonResponse({ ok: true }));

      render(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(SettingsPage),
          React.createElement(Modal),
        ),
      );

      fireEvent.click(screen.getByRole('button', { name: '로그인 관리' }));
      fireEvent.click(await screen.findByRole('button', { name: '로그아웃' }));
      fireEvent.click(await screen.findByRole('button', { name: '예' }));

      await waitFor(() => {
        expect(routerPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('login page redirect', () => {
    it('이미 로그인된 상태에서 /login 진입 시 디바이스 정보가 전송된다', async () => {
      setAuthenticatedSession(sessionPayload);
      DeviceService.setIsInApp(true);
      DeviceService.setDeviceToken('device-token');
      DeviceService.setPlatform('ios');
      (window as typeof window & { isInApp?: boolean }).isInApp = true;
      setReturnToUrl('/explore');
      fetchMock.mockResolvedValueOnce(
        createJsonResponse({
          errors: [],
          data: {
            message: 'saved',
            deviceToken: 'device-token',
            platform: 'ios',
          },
        }),
      );

      render(React.createElement(LoginPage));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          '/bottle-api/v1/push/token',
          expect.objectContaining({
            method: 'POST',
          }),
        );
      });
    });

    it('이미 로그인된 상태에서 /login 진입 시 returnTo 경로로 복귀한다', async () => {
      setAuthenticatedSession(sessionPayload);
      setReturnToUrl('/explore');

      render(React.createElement(LoginPage));

      await waitFor(() => {
        expect(routerReplace).toHaveBeenCalledWith('/explore');
      });
    });
  });
});
