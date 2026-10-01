/**
 * @jest-environment node
 */
import { fetchProductApi } from './productApi';

const originalEnv = process.env;

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('fetchProductApi', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      INTERNAL_SERVER_URL: 'https://product-api.internal',
    };
    delete process.env.API_SERVER_WARP_URL;
    global.fetch = fetchMock;
    fetchMock.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('성공 응답의 data를 돌려주고 캐시 수명과 태그를 fetch에 전달한다', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        success: true,
        code: 200,
        data: { id: 1 },
        errors: [],
      }),
    );

    const result = await fetchProductApi('/alcohols/1', {
      revalidate: 600,
      tags: ['alcohol:1'],
    });

    expect(result).toEqual({ status: 'ok', data: { id: 1 } });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://product-api.internal/api/v1/alcohols/1',
      expect.objectContaining({
        next: { revalidate: 600, tags: ['alcohol:1'] },
        headers: expect.objectContaining({ 'X-Bottlenote-Caller': 'ssr' }),
      }),
    );
  });

  it('404 또는 *_NOT_FOUND 오류 코드는 not-found로 구분한다', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(404, {
        success: false,
        data: [],
        errors: [
          { code: 'ALCOHOL_NOT_FOUND', status: 'NOT_FOUND', message: '' },
        ],
      }),
    );
    // 리뷰 상세는 없는 리뷰에 400 + REVIEW_NOT_FOUND를 응답한다.
    fetchMock.mockResolvedValueOnce(
      jsonResponse(400, {
        success: false,
        data: [],
        errors: [
          { code: 'REVIEW_NOT_FOUND', status: 'BAD_REQUEST', message: '' },
        ],
      }),
    );

    const options = { revalidate: 60, tags: [] };
    await expect(fetchProductApi('/alcohols/0', options)).resolves.toEqual({
      status: 'not-found',
    });
    await expect(
      fetchProductApi('/reviews/detail/0', options),
    ).resolves.toEqual({ status: 'not-found' });
  });

  it('서버 오류와 네트워크 실패는 error로 돌려준다', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(500, { errors: [] }));
    fetchMock.mockRejectedValueOnce(new Error('ECONNRESET'));

    const options = { version: 'v2' as const, revalidate: 60, tags: [] };
    await expect(fetchProductApi('/curations/1', options)).resolves.toEqual({
      status: 'error',
    });
    await expect(fetchProductApi('/curations/1', options)).resolves.toEqual({
      status: 'error',
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://product-api.internal/api/v2/curations/1',
      expect.anything(),
    );
  });
});
