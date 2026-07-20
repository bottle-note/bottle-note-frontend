import { apiClient } from './apiClient';

jest.mock('@/lib/auth/session-store', () => ({
  clearAuthSession: jest.fn(),
  getAuthSnapshot: () => ({ status: 'unauthenticated', session: null }),
  restoreAuthSession: jest.fn(),
}));

jest.mock('@/store/modalStore', () => ({
  __esModule: true,
  default: {
    getState: () => ({ handleLoginState: jest.fn() }),
  },
}));

describe('apiClient request cancellation', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('AbortError를 일반 네트워크 오류로 변환하거나 콘솔 오류로 남기지 않는다', async () => {
    const abortError = new DOMException(
      'The operation was aborted.',
      'AbortError',
    );
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    global.fetch = jest.fn().mockRejectedValue(abortError);

    await expect(
      apiClient.get('/test', {
        authRequired: false,
        signal: new AbortController().signal,
      }),
    ).rejects.toBe(abortError);

    expect(consoleError).not.toHaveBeenCalled();
  });
});
