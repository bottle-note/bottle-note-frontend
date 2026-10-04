import sitemap from './sitemap';

const originalFetch = global.fetch;
const originalNodeEnv = process.env.NODE_ENV;
const originalInternalServerUrl = process.env.INTERNAL_SERVER_URL;

describe('sitemap', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalNodeEnv,
      configurable: true,
      writable: true,
    });
    if (originalInternalServerUrl === undefined) {
      delete process.env.INTERNAL_SERVER_URL;
    } else {
      process.env.INTERNAL_SERVER_URL = originalInternalServerUrl;
    }
  });

  it('공개 큐레이션 피드의 모든 유형과 다음 커서를 조회해 상세 URL을 넣는다', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      configurable: true,
      writable: true,
    });
    process.env.INTERNAL_SERVER_URL = 'https://api.example.com';

    const requestedUrls: URL[] = [];
    global.fetch = jest.fn(async (input) => {
      const url = new URL(String(input));
      requestedUrls.push(url);
      const isCuration = url.pathname === '/api/v2/curations/feed';
      const isNextPage = url.searchParams.has('cursor');

      return {
        ok: true,
        json: async () => ({
          errors: [],
          data: {
            items: isCuration ? [{ id: isNextPage ? 22 : 11 }] : [],
          },
          meta: {
            pagination: {
              hasNext: isCuration && !isNextPage,
              nextCursor: isCuration && !isNextPage ? 'next+cursor/=' : null,
            },
          },
        }),
      } as Response;
    });

    const pages = await sitemap();
    const requestsAfterFirstSitemap = requestedUrls.length;
    const cachedPages = await sitemap();
    const curationRequests = requestedUrls.filter(
      (url) => url.pathname === '/api/v2/curations/feed',
    );

    expect(curationRequests).toHaveLength(2);
    expect(requestedUrls).toHaveLength(requestsAfterFirstSitemap);
    expect(cachedPages).toEqual(pages);
    expect(curationRequests[0].searchParams.getAll('code')).toEqual([
      'PROGRAM',
      'RECOMMENDED_WHISKY',
      'WHISKY_PAIRING',
      'WHISKY_TASTING_EVENT',
    ]);
    expect(curationRequests[0].searchParams.get('size')).toBe('100');
    expect(curationRequests[1].searchParams.get('cursor')).toBe(
      'next+cursor/=',
    );
    expect(pages.map((page) => page.url)).toEqual(
      expect.arrayContaining([
        'https://bottle-note.com/curation',
        'https://bottle-note.com/curation/11',
        'https://bottle-note.com/curation/22',
      ]),
    );

    const baselineTime = Date.now();
    const dateNow = jest
      .spyOn(Date, 'now')
      .mockReturnValue(baselineTime + 60 * 60 * 1000 + 1);
    try {
      await sitemap();
      expect(requestedUrls).toHaveLength(requestsAfterFirstSitemap + 3);
      expect(
        requestedUrls.filter((url) =>
          url.pathname.includes('/alcohols/explore/standard'),
        ),
      ).toHaveLength(1);

      dateNow.mockReturnValue(baselineTime + 24 * 60 * 60 * 1000 + 1);
      await sitemap();
      expect(
        requestedUrls.filter((url) =>
          url.pathname.includes('/alcohols/explore/standard'),
        ),
      ).toHaveLength(2);
    } finally {
      dateNow.mockRestore();
    }
  });
});
