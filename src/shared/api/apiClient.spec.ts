import { useAuth } from '@/hooks/auth/useAuth';
import { AuthApi } from '@/app/api/AuthApi';
import useModalStore from '@/store/modalStore';
import { apiClient } from './apiClient';

// Mock dependencies
jest.mock('@/hooks/auth/useAuth');
jest.mock('@/app/api/AuthApi', () => ({
  AuthApi: {
    server: {
      renewToken: jest.fn(),
    },
    client: {
      renewToken: jest.fn(),
    },
  },
}));
jest.mock('@/store/modalStore');

// Mock ApiError
jest.mock('@/utils/ApiError', () => ({
  ApiError: jest.fn().mockImplementation((message, response) => {
    const error = new Error(message);
    (error as any).response = response;
    return error;
  }),
}));

// Fetch mock
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockAuthService = useAuth as jest.Mocked<typeof useAuth>;
const mockAuthApi = AuthApi as jest.Mocked<typeof AuthApi>;
const mockModalStore = useModalStore as jest.MockedFunction<
  typeof useModalStore
>;

describe('ApiClient', () => {
  const mockHandleLoginState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (mockModalStore as any).getState = jest.fn().mockReturnValue({
      handleLoginState: mockHandleLoginState,
    });
  });

  describe('GET 요청', () => {
    it('인증 없이 성공적으로 GET 요청을 수행한다', async () => {
      const mockResponse = { data: { id: 1, name: 'test' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiClient.get('/test', { useAuth: false });

      expect(fetch).toHaveBeenCalledWith('/bottle-api/test', {
        cache: 'no-store',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        method: 'GET',
      });
      expect(result).toEqual(mockResponse);
    });

    it('인증 토큰과 함께 GET 요청을 수행한다', async () => {
      const mockToken = {
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
      };
      mockAuthService.getToken.mockReturnValue(mockToken);

      const mockResponse = { data: { id: 1, name: 'test' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiClient.get('/test');

      expect(fetch).toHaveBeenCalledWith(
        '/bottle-api/test',
        expect.objectContaining({
          headers: expect.any(Headers),
          method: 'GET',
        }),
      );

      const callArgs = (fetch as jest.Mock).mock.calls[0][1];
      expect(callArgs.headers.get('Authorization')).toBe('Bearer valid-token');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('POST 요청', () => {
    it('데이터와 함께 POST 요청을 수행한다', async () => {
      const mockToken = {
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
      };
      mockAuthService.getToken.mockReturnValue(mockToken);

      const requestData = { name: 'test', value: 123 };
      const mockResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiClient.post('/test', requestData);

      expect(fetch).toHaveBeenCalledWith(
        '/bottle-api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('인증 관련 테스트', () => {
    it('토큰이 없을 때 로그인 모달을 띄운다', async () => {
      mockAuthService.getToken.mockReturnValue(null);

      await expect(apiClient.get('/test')).rejects.toThrow(
        'Authentication required',
      );

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockHandleLoginState).toHaveBeenCalledWith(true);
    });

    it('403 에러 시 토큰을 갱신하고 재시도한다', async () => {
      const mockToken = {
        accessToken: 'expired-token',
        refreshToken: 'refresh-token',
      };
      const mockNewToken = {
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      };

      mockAuthService.getToken
        .mockReturnValueOnce(mockToken) // 첫 번째 요청
        .mockReturnValueOnce(mockToken) // 토큰 갱신 시도
        .mockReturnValueOnce(mockNewToken); // 재시도 요청

      (mockAuthApi.client.renewToken as jest.Mock).mockResolvedValueOnce(
        mockNewToken,
      );

      // 첫 번째 요청: 403 에러
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ code: 403, message: 'Token expired' }),
        } as Response)
        // 두 번째 요청: 성공
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' }),
        } as Response);

      const result = await apiClient.get('/test');

      expect(mockAuthApi.client.renewToken).toHaveBeenCalledWith(
        'refresh-token',
      );
      expect(mockAuthService.setToken).toHaveBeenCalledWith(mockNewToken);
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ data: 'success' });
    });

    it('토큰 갱신 실패 시 로그아웃하고 로그인 모달을 띄운다', async () => {
      const mockToken = {
        accessToken: 'expired-token',
        refreshToken: 'invalid-refresh',
      };

      mockAuthService.getToken
        .mockReturnValueOnce(mockToken) // 첫 번째 요청
        .mockReturnValueOnce(mockToken); // 토큰 갱신 시도

      (mockAuthApi.client.renewToken as jest.Mock).mockRejectedValueOnce(
        new Error('Refresh failed'),
      );

      // 첫 번째 요청: 403 에러
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ code: 403, message: 'Token expired' }),
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockHandleLoginState).toHaveBeenCalledWith(true);
    });
  });

  describe('에러 처리', () => {
    it('API 에러를 올바르게 처리한다', async () => {
      const mockToken = {
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
      };
      mockAuthService.getToken.mockReturnValue(mockToken);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          errors: [{ message: 'Bad Request' }],
        }),
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow();
    });

    it('네트워크 에러를 처리한다', async () => {
      const mockToken = {
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
      };
      mockAuthService.getToken.mockReturnValue(mockToken);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow(
        'Network error occurred',
      );
    });

    it('JSON 파싱이 실패해도 처리한다 (204 No Content)', async () => {
      const mockToken = {
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
      };
      mockAuthService.getToken.mockReturnValue(mockToken);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('No content');
        },
      } as unknown as Response);

      const result = await apiClient.get('/test');
      expect(result).toBeNull();
    });
  });

  describe('HTTP 메서드별 테스트', () => {
    beforeEach(() => {
      const mockToken = {
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
      };
      mockAuthService.getToken.mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);
    });

    it('PUT 요청을 올바르게 수행한다', async () => {
      const data = { id: 1, name: 'updated' };
      await apiClient.put('/test', data);

      expect(fetch).toHaveBeenCalledWith(
        '/bottle-api/test',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      );
    });

    it('PATCH 요청을 올바르게 수행한다', async () => {
      const data = { name: 'patched' };
      await apiClient.patch('/test', data);

      expect(fetch).toHaveBeenCalledWith(
        '/bottle-api/test',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data),
        }),
      );
    });

    it('DELETE 요청을 올바르게 수행한다', async () => {
      await apiClient.delete('/test');

      expect(fetch).toHaveBeenCalledWith(
        '/bottle-api/test',
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    });
  });

  describe('옵션 처리', () => {
    it('다른 baseUrl을 사용할 수 있다', async () => {
      mockAuthService.getToken.mockReturnValue(null);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response);

      await apiClient.get('/test', { useAuth: false, baseUrl: 'api' });

      expect(fetch).toHaveBeenCalledWith('/api/test', expect.any(Object));
    });

    it('커스텀 캐시 정책을 적용할 수 있다', async () => {
      mockAuthService.getToken.mockReturnValue(null);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response);

      await apiClient.get('/test', {
        useAuth: false,
        cache: 'force-cache',
      });

      expect(fetch).toHaveBeenCalledWith(
        '/bottle-api/test',
        expect.objectContaining({
          cache: 'force-cache',
        }),
      );
    });
  });
});
