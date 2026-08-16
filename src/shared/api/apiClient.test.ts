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

describe('apiClient request cancellation and semantic errors', () => {
  const originalFetch = global.fetch;
  const createErrorResponse = (status: number, body: unknown) =>
    ({
      ok: false,
      status,
      json: jest.fn().mockResolvedValue(body),
    }) as unknown as Response;

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

  it.each([
    [410, 'CURSOR_EXPIRED'],
    [400, 'INVALID_CURSOR'],
    [400, 'CURSOR_CONTEXT_MISMATCH'],
  ])('errors[0].code=%s를 ApiError.code에 보존한다', async (status, code) => {
    global.fetch = jest.fn().mockResolvedValue(
      createErrorResponse(status, {
        errors: [{ code, message: 'cursor error', status: String(status) }],
      }),
    );

    await expect(
      apiClient.get('/test', { authRequired: false }),
    ).rejects.toMatchObject({
      code,
      message: 'cursor error',
    });
  });

  it('오류 본문 또는 semantic code가 없으면 ApiError.code는 null이다', async () => {
    global.fetch = jest.fn().mockResolvedValue(createErrorResponse(500, null));

    await expect(
      apiClient.get('/test', { authRequired: false }),
    ).rejects.toMatchObject({
      code: null,
    });
  });
});
