import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { THEME_STORAGE_KEY } from './theme';

function createMatchMedia(initialMatches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQueryList = {
    matches: initialMatches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(
      (_event: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
    ),
    removeEventListener: jest.fn(
      (_event: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
    ),
    dispatchEvent: jest.fn(),
  };

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: jest.fn(() => mediaQueryList),
  });

  return {
    change(matches: boolean) {
      mediaQueryList.matches = matches;
      listeners.forEach((listener) =>
        listener({ matches } as MediaQueryListEvent),
      );
    },
  };
}

function ThemeHarness() {
  const { preference, resolvedTheme, isInitialized, setPreference } =
    useTheme();

  return (
    <>
      <p>{`${preference}/${resolvedTheme}/${isInitialized}`}</p>
      <button type="button" onClick={() => setPreference('light')}>
        라이트
      </button>
      <button type="button" onClick={() => setPreference('system')}>
        시스템
      </button>
    </>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.removeProperty('color-scheme');
  });

  it('저장된 선택이 없으면 시스템 테마와 시스템 변경을 따라간다', async () => {
    const media = createMatchMedia(true);

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('system/dark/true')).toBeInTheDocument();
    });
    expect(document.documentElement).toHaveClass('dark');

    act(() => media.change(false));

    expect(screen.getByText('system/light/true')).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('수동 선택은 저장하고 시스템 변경보다 우선하며 시스템 모드로 복귀할 수 있다', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const media = createMatchMedia(false);

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('dark/dark/true')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '라이트' }));

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement).not.toHaveClass('dark');

    act(() => media.change(true));

    expect(screen.getByText('light/light/true')).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass('dark');

    fireEvent.click(screen.getByRole('button', { name: '시스템' }));

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(screen.getByText('system/dark/true')).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');
  });
});
