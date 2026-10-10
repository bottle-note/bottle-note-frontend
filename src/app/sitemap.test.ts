import type sitemapType from './sitemap';

// 캐시가 모듈 상태라 테스트마다 새로 불러온다.
function loadSitemap(): typeof sitemapType {
  jest.resetModules();
  return require('./sitemap').default;
}

// 백그라운드 갱신이 끝날 때까지 대기한다.
const flushRefresh = () => new Promise((resolve) => setTimeout(resolve, 0));

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

  it('공개 큐레이션과 수입 신고의 다음 커서를 끝까지 조회해 상세 URL을 넣는다', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      configurable: true,
      writable: true,
    });
    process.env.INTERNAL_SERVER_URL = 'https://api.example.com';
    const sitemap = loadSitemap();

    const requestedUrls: URL[] = [];
    global.fetch = jest.fn(async (input) => {
      const url = new URL(String(input));
      requestedUrls.push(url);
      const isCuration = url.pathname === '/api/v2/curations/feed';
      const isImportClearance = url.pathname === '/api/v1/mfds/alcohols';
      const isNextPage = url.searchParams.has('cursor');

      return {
        ok: true,
        json: async () => ({
          errors: [],
          data: isImportClearance
            ? [{ id: isNextPage ? 20026 : 19120 }]
            : { items: isCuration ? [{ id: isNextPage ? 22 : 11 }] : [] },
          meta: {
            pagination: {
              hasNext: (isCuration || isImportClearance) && !isNextPage,
              nextCursor:
                (isCuration || isImportClearance) && !isNextPage
                  ? 'next+cursor/='
                  : null,
            },
          },
        }),
      } as Response;
    });

    const firstPages = await sitemap();
    expect(firstPages.map((page) => page.url)).toContain(
      'https://bottle-note.com',
    );
    expect(firstPages.map((page) => page.url)).not.toContain(
      'https://bottle-note.com/import-clearance/alcohol/19120',
    );
    await flushRefresh();

    const pages = await sitemap();
    const requestsAfterFirstSitemap = requestedUrls.length;
    const cachedPages = await sitemap();
    const curationRequests = requestedUrls.filter(
      (url) => url.pathname === '/api/v2/curations/feed',
    );
    const importClearanceRequests = requestedUrls.filter(
      (url) => url.pathname === '/api/v1/mfds/alcohols',
    );

    expect(curationRequests).toHaveLength(2);
    expect(importClearanceRequests).toHaveLength(2);
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
    expect(importClearanceRequests[1].searchParams.get('cursor')).toBe(
      'next+cursor/=',
    );
    expect(pages.map((page) => page.url)).toEqual(
      expect.arrayContaining([
        'https://bottle-note.com/curation',
        'https://bottle-note.com/curation/11',
        'https://bottle-note.com/curation/22',
        'https://bottle-note.com/import-clearance/alcohol/19120',
        'https://bottle-note.com/import-clearance/alcohol/20026',
      ]),
    );

    const baselineTime = Date.now();
    const dateNow = jest
      .spyOn(Date, 'now')
      .mockReturnValue(baselineTime + 60 * 60 * 1000 + 1);
    try {
      await sitemap();
      await flushRefresh();
      expect(requestedUrls).toHaveLength(requestsAfterFirstSitemap + 3);
      expect(
        requestedUrls.filter((url) =>
          url.pathname.includes('/alcohols/explore/standard'),
        ),
      ).toHaveLength(1);

      dateNow.mockReturnValue(baselineTime + 24 * 60 * 60 * 1000 + 1);
      await sitemap();
      await flushRefresh();
      expect(
        requestedUrls.filter((url) =>
          url.pathname.includes('/alcohols/explore/standard'),
        ),
      ).toHaveLength(2);
      expect(
        requestedUrls.filter((url) => url.pathname === '/api/v1/mfds/alcohols'),
      ).toHaveLength(4);
    } finally {
      dateNow.mockRestore();
    }
  });
  it('캐시가 만료돼도 갱신을 기다리지 않고 이전 sitemap을 응답한 뒤, 갱신이 끝나면 새 URL을 응답한다', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      configurable: true,
      writable: true,
    });
    process.env.INTERNAL_SERVER_URL = 'https://api.example.com';
    const sitemap = loadSitemap();

    let importClearanceIds = [19120];
    let holdImportClearance = false;
    let releaseImportClearance = () => {};
    global.fetch = jest.fn(async (input) => {
      const url = new URL(String(input));
      const isImportClearance = url.pathname === '/api/v1/mfds/alcohols';
      if (isImportClearance && holdImportClearance) {
        await new Promise<void>((resolve) => {
          releaseImportClearance = resolve;
        });
      }

      return {
        ok: true,
        json: async () => ({
          errors: [],
          data: isImportClearance
            ? importClearanceIds.map((id) => ({ id }))
            : { items: [] },
          meta: { pagination: { hasNext: false, nextCursor: null } },
        }),
      } as Response;
    });

    const importClearanceUrl = (id: number) =>
      `https://bottle-note.com/import-clearance/alcohol/${id}`;
    await sitemap();
    await flushRefresh();
    const firstPages = await sitemap();
    expect(firstPages.map((page) => page.url)).toContain(
      importClearanceUrl(19120),
    );

    // 24시간 뒤, 수입 신고 목록 응답이 끝나지 않는 상태
    importClearanceIds = [19120, 20026];
    holdImportClearance = true;
    const dateNow = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.now() + 24 * 60 * 60 * 1000 + 1);
    try {
      const stalePages = await sitemap();
      expect(stalePages).toEqual(firstPages);

      releaseImportClearance();
      await flushRefresh();

      const refreshedPages = await sitemap();
      expect(refreshedPages.map((page) => page.url)).toContain(
        importClearanceUrl(20026),
      );
    } finally {
      dateNow.mockRestore();
    }
  });
  it('첫 조회가 끝나지 않아도 정적 URL을 즉시 응답하고, 완료 후 동적 URL을 포함한다', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      configurable: true,
      writable: true,
    });
    process.env.INTERNAL_SERVER_URL = 'https://api.example.com';
    const sitemap = loadSitemap();

    let releaseImportClearance = () => {};
    global.fetch = jest.fn(async (input) => {
      const url = new URL(String(input));
      const isImportClearance = url.pathname === '/api/v1/mfds/alcohols';
      if (isImportClearance) {
        await new Promise<void>((resolve) => {
          releaseImportClearance = resolve;
        });
      }

      return {
        ok: true,
        json: async () => ({
          errors: [],
          data: isImportClearance ? [{ id: 19120 }] : { items: [] },
          meta: { pagination: { hasNext: false, nextCursor: null } },
        }),
      } as Response;
    });

    const firstPages = await sitemap();
    expect(firstPages.map((page) => page.url)).toContain(
      'https://bottle-note.com',
    );
    expect(firstPages.map((page) => page.url)).not.toContain(
      'https://bottle-note.com/import-clearance/alcohol/19120',
    );

    releaseImportClearance();
    await flushRefresh();

    const refreshedPages = await sitemap();
    expect(refreshedPages.map((page) => page.url)).toContain(
      'https://bottle-note.com/import-clearance/alcohol/19120',
    );
  });
});
