import { describe, it, expect } from 'vitest';
import { isValidReturnUrl, getReturnToUrl } from './loginRedirect';

describe('loginRedirect 유틸리티', () => {
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
        expect(
          isValidReturnUrl('data:text/html,<script>alert(1)</script>'),
        ).toBe(false);
      });

      it('vbscript: 프로토콜은 차단한다', () => {
        expect(isValidReturnUrl('vbscript:msgbox(1)')).toBe(false);
      });

      it('blob: 프로토콜은 차단한다', () => {
        expect(isValidReturnUrl('blob:https://evil.com/uuid')).toBe(false);
      });

      // Oralyzer 기반 우회 케이스
      it('백슬래시 우회를 차단한다', () => {
        expect(isValidReturnUrl('/\\evil.com')).toBe(false);
        expect(isValidReturnUrl('/\\/evil.com')).toBe(false);
        expect(isValidReturnUrl('/\\/\\evil.com')).toBe(false);
      });

      it('URL 인코딩된 슬래시 우회를 차단한다', () => {
        expect(isValidReturnUrl('/%2fevil.com')).toBe(false);
        expect(isValidReturnUrl('/%2Fevil.com')).toBe(false);
        expect(isValidReturnUrl('/%2f%2fevil.com')).toBe(false);
      });

      it('탭/개행 문자 삽입 우회를 차단한다', () => {
        expect(isValidReturnUrl('/\t/evil.com')).toBe(false);
        expect(isValidReturnUrl('/\n/evil.com')).toBe(false);
        expect(isValidReturnUrl('/\r/evil.com')).toBe(false);
        expect(isValidReturnUrl('/ /evil.com')).toBe(false);
      });

      it('대소문자 혼합 프로토콜을 차단한다', () => {
        expect(isValidReturnUrl('JAVASCRIPT:alert(1)')).toBe(false);
        expect(isValidReturnUrl('JavaScript:alert(1)')).toBe(false);
        expect(isValidReturnUrl('DATA:text/html')).toBe(false);
      });

      it('다중 슬래시 우회를 차단한다', () => {
        expect(isValidReturnUrl('///evil.com')).toBe(false);
        expect(isValidReturnUrl('////evil.com')).toBe(false);
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

  describe('getReturnToUrl', () => {
    it('유효한 쿼리 주소를 반환한다', () => {
      expect(getReturnToUrl('/search/whisky/123')).toBe('/search/whisky/123');
    });

    it('쿼리 주소가 없으면 루트를 반환한다', () => {
      expect(getReturnToUrl(null)).toBe('/');
    });

    it('쿼리 주소가 유효하지 않으면 루트를 반환한다', () => {
      expect(getReturnToUrl('https://evil.com')).toBe('/');
    });

    it('쿼리 주소가 로그인 경로면 루트를 반환한다', () => {
      expect(getReturnToUrl('/login')).toBe('/');
    });
  });
});
