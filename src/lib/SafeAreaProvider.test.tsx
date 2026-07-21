// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from '@testing-library/react';
import { SafeAreaProvider } from './SafeAreaProvider';

const originalUserAgent = window.navigator.userAgent;

const setUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    value: userAgent,
  });
};

const clearAndroidSafeArea = () => {
  document.documentElement.style.removeProperty('--android-safe-area-top');
  document.documentElement.style.removeProperty('--android-safe-area-bottom');
};

describe('SafeAreaProvider', () => {
  beforeEach(() => {
    clearAndroidSafeArea();
    window.isInApp = false;
  });

  afterAll(() => {
    clearAndroidSafeArea();
    setUserAgent(originalUserAgent);
  });

  it('Android 인앱 WebView에만 24px fallback을 적용한다', () => {
    window.isInApp = true;
    setUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36');

    render(
      <SafeAreaProvider>
        <div>content</div>
      </SafeAreaProvider>,
    );

    expect(
      document.documentElement.style.getPropertyValue(
        '--android-safe-area-top',
      ),
    ).toBe('24px');
    expect(
      document.documentElement.style.getPropertyValue(
        '--android-safe-area-bottom',
      ),
    ).toBe('24px');
  });

  it('일반 Android 모바일 브라우저에는 fallback을 적용하지 않는다', () => {
    window.isInApp = false;
    setUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36');

    render(
      <SafeAreaProvider>
        <div>content</div>
      </SafeAreaProvider>,
    );

    expect(
      document.documentElement.style.getPropertyValue(
        '--android-safe-area-top',
      ),
    ).toBe('');
    expect(
      document.documentElement.style.getPropertyValue(
        '--android-safe-area-bottom',
      ),
    ).toBe('');
  });

  it('iOS 인앱 WebView에는 Android fallback을 적용하지 않는다', () => {
    window.isInApp = true;
    setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
    );

    render(
      <SafeAreaProvider>
        <div>content</div>
      </SafeAreaProvider>,
    );

    expect(
      document.documentElement.style.getPropertyValue(
        '--android-safe-area-top',
      ),
    ).toBe('');
    expect(
      document.documentElement.style.getPropertyValue(
        '--android-safe-area-bottom',
      ),
    ).toBe('');
  });
});
