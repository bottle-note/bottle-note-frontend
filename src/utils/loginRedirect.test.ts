import {
  isValidReturnUrl,
  getReturnToFromSearchParams,
  clearReturnToUrl,
  getPendingReturnToUrl,
  setReturnToUrl,
  LOGIN_RETURN_TO_KEY,
} from './loginRedirect';

describe('로그인 복귀 목적지', () => {
  beforeEach(() => sessionStorage.clear());

  it('내부 상대 경로와 쿼리는 허용한다', () => {
    const urls = [
      '',
      '/',
      '/search',
      '/search/whisky/123',
      '/my-page',
      '/search?category=whisky',
      '/explore?tab=review&sort=recent',
    ];
    for (const url of urls) {
      expect({ url, valid: isValidReturnUrl(url) }).toEqual({
        url,
        valid: true,
      });
    }
  });

  it.each([
    [
      '외부 주소와 프로토콜',
      [
        'https://evil.com',
        'http://evil.com',
        'https://evil.com/login',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        'blob:https://evil.com/uuid',
        'JAVASCRIPT:alert(1)',
        'JavaScript:alert(1)',
        'DATA:text/html',
      ],
    ],
    [
      '슬래시와 백슬래시 우회',
      [
        '//evil.com',
        '//evil.com/path',
        '///evil.com',
        '////evil.com',
        '/\\evil.com',
        '/\\/evil.com',
        '/\\/\\evil.com',
      ],
    ],
    ['인코딩된 슬래시', ['/%2fevil.com', '/%2Fevil.com', '/%2f%2fevil.com']],
    [
      '공백 문자 우회',
      ['/\t/evil.com', '/\n/evil.com', '/\r/evil.com', '/ /evil.com'],
    ],
    [
      '로그인 순환 경로',
      [
        '/login',
        '/login?returnTo=/home',
        '/oauth',
        '/oauth/kakao',
        '/oauth/apple',
      ],
    ],
  ] as const)('%s는 복귀 목적지로 차단한다', (_reason, urls) => {
    for (const url of urls) {
      expect({ url, valid: isValidReturnUrl(url) }).toEqual({
        url,
        valid: false,
      });
    }
  });

  it('유효한 목적지만 저장하고 외부 주소와 로그인 경로는 저장하지 않는다', () => {
    setReturnToUrl('/search/whisky/123');
    expect(getPendingReturnToUrl()).toBe('/search/whisky/123');
    clearReturnToUrl();
    for (const url of ['https://evil.com', '/login']) {
      setReturnToUrl(url);
      expect(sessionStorage.getItem(LOGIN_RETURN_TO_KEY)).toBeNull();
    }
  });

  it.each([
    ['returnTo=/explore%3Ftab%3Dreview', '/history', '/explore?tab=review'],
    ['', '/history', '/history'],
    ['', null, '/'],
    ['', 'https://evil.com', '/'],
    ['returnTo=https%3A%2F%2Fevil.com', '/history', '/'],
    ['returnTo=', '/history', '/'],
  ])('쿼리 %s와 저장소 %s에서 %s로 복귀한다', (query, stored, expected) => {
    if (stored !== null) sessionStorage.setItem(LOGIN_RETURN_TO_KEY, stored);
    expect(getReturnToFromSearchParams(new URLSearchParams(query!))).toBe(
      expected,
    );
    expect(sessionStorage.getItem(LOGIN_RETURN_TO_KEY)).toBe(stored);
  });

  it('조회 중에는 목적지를 유지하고, 복귀 후 정리하면 홈을 사용한다', () => {
    setReturnToUrl('/explore?tab=review');
    expect(getPendingReturnToUrl()).toBe('/explore?tab=review');
    expect(getReturnToFromSearchParams(new URLSearchParams())).toBe(
      '/explore?tab=review',
    );
    expect(sessionStorage.getItem(LOGIN_RETURN_TO_KEY)).toBe(
      '/explore?tab=review',
    );
    clearReturnToUrl();
    expect(getPendingReturnToUrl()).toBeNull();
    expect(getReturnToFromSearchParams(new URLSearchParams())).toBe('/');
  });
});
