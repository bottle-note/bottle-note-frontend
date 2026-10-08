import robots from './robots';

const originalDeployEnv = process.env.NEXT_PUBLIC_DEPLOY_ENV;

describe('robots', () => {
  afterEach(() => {
    if (originalDeployEnv === undefined) {
      delete process.env.NEXT_PUBLIC_DEPLOY_ENV;
    } else {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = originalDeployEnv;
    }
  });

  it.each([
    ['개발 배포', 'development'],
    ['배포 환경 값이 없는 프리뷰', undefined],
  ])('%s는 전체 크롤링을 막고 sitemap을 알리지 않는다', (_, deployEnv) => {
    if (deployEnv === undefined) {
      delete process.env.NEXT_PUBLIC_DEPLOY_ENV;
    } else {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = deployEnv;
    }

    expect(robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } });
  });

  it('운영 배포는 크롤링을 허용하고 운영 sitemap을 알린다', () => {
    process.env.NEXT_PUBLIC_DEPLOY_ENV = 'production';

    const result = robots();

    expect(result.rules).toEqual([
      expect.objectContaining({ userAgent: '*', allow: '/' }),
    ]);
    expect(result.sitemap).toBe('https://bottle-note.com/sitemap.xml');
  });
});
