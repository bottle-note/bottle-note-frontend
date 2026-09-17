import {
  APP_STORE_PROMPT_PREFERENCE_KEY,
  canShowAppStorePrompt,
  createDismissedPreference,
  createStoreClickedPreference,
  detectMobileOperatingSystem,
  isAppStorePromptRoute,
  readAppStorePromptPreference,
  type AppStorePromptPreference,
} from './appStorePrompt';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-09-16T00:00:00.000Z').getTime();

const initialPreference: AppStorePromptPreference = {
  version: 1,
  dismissCount: 0,
  nextEligibleAt: null,
  disabled: false,
};

describe('앱 스토어 유도 노출 정책', () => {
  describe('노출 페이지 판별', () => {
    it.each([
      '/explore',
      '/search',
      '/curation',
      '/search/whisky/123',
      '/search/whisky/123/reviews',
      '/review/456',
      '/curation/789',
      '/curation/789/',
    ])('%s는 목록 또는 상세 페이지로 판별한다', (pathname) => {
      expect(isAppStorePromptRoute(pathname)).toBe(true);
    });

    it.each([
      '/',
      '/search/input',
      '/review/register',
      '/review/modify',
      '/settings',
      '/user/1',
      '/inquire',
    ])('%s에서는 노출하지 않는다', (pathname) => {
      expect(isAppStorePromptRoute(pathname)).toBe(false);
    });
  });

  describe('모바일 운영체제 판별', () => {
    it('Android 브라우저를 판별한다', () => {
      expect(
        detectMobileOperatingSystem({
          userAgent:
            'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36',
        }),
      ).toBe('android');
    });

    it('iPhone과 데스크톱 모드 iPad를 iOS로 판별한다', () => {
      expect(
        detectMobileOperatingSystem({
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
        }),
      ).toBe('ios');
      expect(
        detectMobileOperatingSystem({
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          platform: 'MacIntel',
          maxTouchPoints: 5,
        }),
      ).toBe('ios');
    });

    it('데스크톱 브라우저는 제외한다', () => {
      expect(
        detectMobileOperatingSystem({
          userAgent:
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140 Safari/537.36',
          platform: 'Linux x86_64',
          maxTouchPoints: 0,
        }),
      ).toBeNull();
    });
  });

  describe('재노출 주기', () => {
    it('첫 닫기는 7일, 두 번째 닫기는 30일 동안 숨긴다', () => {
      const firstDismissal = createDismissedPreference(initialPreference, NOW);
      expect(firstDismissal).toEqual({
        version: 1,
        dismissCount: 1,
        nextEligibleAt: NOW + 7 * DAY_MS,
        disabled: false,
      });
      expect(canShowAppStorePrompt(firstDismissal, NOW + 7 * DAY_MS - 1)).toBe(
        false,
      );
      expect(canShowAppStorePrompt(firstDismissal, NOW + 7 * DAY_MS)).toBe(
        true,
      );

      const secondDismissal = createDismissedPreference(firstDismissal, NOW);
      expect(secondDismissal.nextEligibleAt).toBe(NOW + 30 * DAY_MS);
      expect(secondDismissal.dismissCount).toBe(2);
      expect(secondDismissal.disabled).toBe(false);
    });

    it('세 번째 닫기부터 자동 노출을 중단한다', () => {
      const preference = createDismissedPreference(
        {
          ...initialPreference,
          dismissCount: 2,
        },
        NOW,
      );

      expect(preference.disabled).toBe(true);
      expect(canShowAppStorePrompt(preference, NOW + 365 * DAY_MS)).toBe(false);
    });

    it('스토어 CTA를 누르면 30일 동안 숨긴다', () => {
      const preference = createStoreClickedPreference(initialPreference, NOW);

      expect(preference.nextEligibleAt).toBe(NOW + 30 * DAY_MS);
      expect(preference.dismissCount).toBe(0);
    });

    it('저장값이 손상되면 최초 상태로 안전하게 복구한다', () => {
      const storage = {
        getItem: jest.fn((key: string) =>
          key === APP_STORE_PROMPT_PREFERENCE_KEY ? '{broken-json' : null,
        ),
      };

      expect(readAppStorePromptPreference(storage)).toEqual(initialPreference);
    });
  });
});
