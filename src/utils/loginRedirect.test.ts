import {
  isValidReturnUrl,
  getReturnToUrl,
  setReturnToUrl,
  LOGIN_RETURN_TO_KEY,
} from './loginRedirect';

describe('loginRedirect 유틸리티', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('isValidReturnUrl', () => {
    describe('허용되는 URL', () => {
      it('빈 문자열은 허용한다', () => {
        expect(isValidReturnUrl('')).toBe(true);
      });

      it('루트 경로는 허용한다', () => {
        expect(isValidReturnUrl('/')).toBe(true);
      });

      it('상대 경로는 허용한다', () => {
        expect(isValidReturnUrl('/search')).toBe(true);
        expect(isValidReturnUrl('/search/whisky/123')).toBe(true);
        expect(isValidReturnUrl('/my-page')).toBe(true);
      });

      it('쿼리 파라미터가 포함된 상대 경로는 허용한다', () => {
        expect(isValidReturnUrl('/search?category=whisky')).toBe(true);
        expect(isValidReturnUrl('/explore?tab=review&sort=recent')).toBe(true);
      });
    });

    describe('차단되는 URL', () => {
      it('프로토콜 상대 URL은 차단한다 (Open Redirect 방지)', () => {
        expect(isValidReturnUrl('//evil.com')).toBe(false);
        expect(isValidReturnUrl('//evil.com/path')).toBe(false);
      });

      it('절대 URL은 차단한다', () => {
        expect(isValidReturnUrl('https://evil.com')).toBe(false);
        expect(isValidReturnUrl('http://evil.com')).toBe(false);
        expect(isValidReturnUrl('https://evil.com/login')).toBe(false);
      });

      it('javascript: 프로토콜은 차단한다', () => {
        expect(isValidReturnUrl('javascript:alert(1)')).toBe(false);
      });

      it('data: 프로토콜은 차단한다', () => {
        expect(isValidReturnUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      });

      it('로그인 관련 경로는 차단한다 (무한 루프 방지)', () => {
        expect(isValidReturnUrl('/login')).toBe(false);
        expect(isValidReturnUrl('/login?returnTo=/home')).toBe(false);
        expect(isValidReturnUrl('/oauth')).toBe(false);
        expect(isValidReturnUrl('/oauth/kakao')).toBe(false);
        expect(isValidReturnUrl('/oauth/apple')).toBe(false);
      });
    });
  });

  describe('setReturnToUrl', () => {
    it('유효한 URL을 sessionStorage에 저장한다', () => {
      setReturnToUrl('/search/whisky/123');

      expect(sessionStorage.getItem(LOGIN_RETURN_TO_KEY)).toBe('/search/whisky/123');
    });

    it('유효하지 않은 URL은 저장하지 않는다', () => {
      setReturnToUrl('https://evil.com');

      expect(sessionStorage.getItem(LOGIN_RETURN_TO_KEY)).toBeNull();
    });

    it('로그인 경로는 저장하지 않는다', () => {
      setReturnToUrl('/login');

      expect(sessionStorage.getItem(LOGIN_RETURN_TO_KEY)).toBeNull();
    });

    it('이미 같은 값이 저장되어 있으면 다시 저장하지 않는다', () => {
      const spy = jest.spyOn(Storage.prototype, 'setItem');

      setReturnToUrl('/search');
      setReturnToUrl('/search');

      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });
  });

  describe('getReturnToUrl', () => {
    it('저장된 URL을 반환하고 sessionStorage에서 제거한다', () => {
      sessionStorage.setItem(LOGIN_RETURN_TO_KEY, '/search/whisky/123');

      const result = getReturnToUrl();

      expect(result).toBe('/search/whisky/123');
      expect(sessionStorage.getItem(LOGIN_RETURN_TO_KEY)).toBeNull();
    });

    it('저장된 URL이 없으면 루트를 반환한다', () => {
      const result = getReturnToUrl();

      expect(result).toBe('/');
    });

    it('저장된 URL이 유효하지 않으면 루트를 반환한다', () => {
      // 직접 sessionStorage에 악성 URL 주입 시도
      sessionStorage.setItem(LOGIN_RETURN_TO_KEY, 'https://evil.com');

      const result = getReturnToUrl();

      expect(result).toBe('/');
    });

    it('저장된 URL이 로그인 경로면 루트를 반환한다', () => {
      sessionStorage.setItem(LOGIN_RETURN_TO_KEY, '/login');

      const result = getReturnToUrl();

      expect(result).toBe('/');
    });
  });

  describe('통합 시나리오', () => {
    it('저장 후 가져오기 플로우가 정상 동작한다', () => {
      // 1. 사용자가 /search/whisky/123 페이지에서 로그인 모달 클릭
      setReturnToUrl('/search/whisky/123');

      // 2. 로그인 완료 후 원래 페이지로 리다이렉트
      const returnUrl = getReturnToUrl();
      expect(returnUrl).toBe('/search/whisky/123');

      // 3. 한 번 사용 후 다시 호출하면 루트 반환 (일회용)
      const secondCall = getReturnToUrl();
      expect(secondCall).toBe('/');
    });
  });
});
