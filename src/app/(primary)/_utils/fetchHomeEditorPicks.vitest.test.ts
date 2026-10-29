import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchHomeEditorPicks } from './fetchHomeEditorPicks';

const item = (id: number) => ({
  id,
  name: `큐레이션 ${id}`,
  description: '',
  coverImageUrl: '',
  imageUrls: [],
  exposureStartDate: '2026-10-01',
  exposureEndDate: '2026-12-31',
  displayOrder: id,
  createAt: '2026-10-01',
  payload: null,
});

const ok = (ids: number[]) =>
  new Response(JSON.stringify({ data: { items: ids.map(item) } }));

describe('fetchHomeEditorPicks', () => {
  beforeEach(() => {
    vi.stubEnv('INTERNAL_SERVER_URL', 'http://product-api.internal');
    vi.stubEnv('API_SERVER_WARP_URL', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('종류별로 2개씩 따로 요청해 요청한 spec 코드를 붙이고, 시음회부터 순서대로 합친다', async () => {
    const fetchMock = vi.fn((url: string, _init?: RequestInit) => {
      const code = new URL(url).searchParams.get('code');
      const ids: Record<string, number[]> = {
        WHISKY_TASTING_EVENT: [1, 2],
        PROGRAM: [5, 6],
        RECOMMENDED_WHISKY: [7, 8],
        WHISKY_PAIRING: [10],
      };
      return Promise.resolve(ok(ids[code ?? ''] ?? []));
    });
    vi.stubGlobal('fetch', fetchMock);

    const curations = await fetchHomeEditorPicks();

    expect(fetchMock).toHaveBeenCalledTimes(4);
    fetchMock.mock.calls.forEach(([url, init]) => {
      const params = new URL(url).searchParams;
      expect(params.getAll('code')).toHaveLength(1);
      expect(params.get('size')).toBe('2');
      expect(init).toMatchObject({ next: { revalidate: 3600 } });
    });
    expect(curations.map(({ id, specCode }) => [id, specCode])).toEqual([
      [1, 'WHISKY_TASTING_EVENT'],
      [2, 'WHISKY_TASTING_EVENT'],
      [5, 'PROGRAM'],
      [6, 'PROGRAM'],
      [7, 'RECOMMENDED_WHISKY'],
      [8, 'RECOMMENDED_WHISKY'],
      [10, 'WHISKY_PAIRING'],
    ]);
  });

  it('한 종류의 요청이 실패해도 나머지 종류는 보여준다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const code = new URL(url).searchParams.get('code');
        if (code === 'WHISKY_TASTING_EVENT') {
          return Promise.reject(new Error('down'));
        }
        if (code === 'PROGRAM') {
          return Promise.resolve(new Response('', { status: 500 }));
        }
        return Promise.resolve(ok(code === 'RECOMMENDED_WHISKY' ? [7] : []));
      }),
    );

    const curations = await fetchHomeEditorPicks();

    expect(curations.map(({ id, specCode }) => [id, specCode])).toEqual([
      [7, 'RECOMMENDED_WHISKY'],
    ]);
  });
});
