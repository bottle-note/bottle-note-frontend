import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  DARK_MODE_MEDIA_QUERY,
  THEME_STORAGE_KEY,
  ThemeProvider,
  useTheme,
} from './ThemeProvider';

let systemThemeListener: ((event: MediaQueryListEvent) => void) | undefined;

const mockSystemTheme = (isDarkMode: boolean) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: isDarkMode && query === DARK_MODE_MEDIA_QUERY,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(
      (_eventName: string, listener: (event: MediaQueryListEvent) => void) => {
        systemThemeListener = listener;
      },
    ),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

const ThemeConsumer = () => {
  const { preference, theme, setThemePreference } = useTheme();

  return (
    <>
      <span>{`${preference}:${theme}`}</span>
      <button type="button" onClick={() => setThemePreference('light')}>
        라이트 모드
      </button>
      <button type="button" onClick={() => setThemePreference('dark')}>
        다크 모드
      </button>
      <button type="button" onClick={() => setThemePreference('system')}>
        시스템 설정 따르기
      </button>
    </>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = 'touch-manipulation';
    document.documentElement.style.colorScheme = '';
    systemThemeListener = undefined;
    mockSystemTheme(false);
  });

  it('저장값이 없으면 시스템 테마를 적용한다', async () => {
    mockSystemTheme(true);

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('system:dark')).toBeInTheDocument();
      expect(document.documentElement).toHaveClass('dark');
      expect(document.documentElement.style.colorScheme).toBe('dark');
    });
  });

  it('저장된 선택값은 시스템 테마보다 우선한다', async () => {
    mockSystemTheme(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('light:light')).toBeInTheDocument();
      expect(document.documentElement).not.toHaveClass('dark');
      expect(document.documentElement.style.colorScheme).toBe('light');
    });
  });

  it('명시 선택을 저장하고 html 테마를 즉시 갱신한다', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '다크 모드' }));

    await waitFor(() => {
      expect(screen.getByText('dark:dark')).toBeInTheDocument();
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
      expect(document.documentElement).toHaveClass('dark');
      expect(document.documentElement.style.colorScheme).toBe('dark');
    });
  });

  it('시스템 설정 추종 중에는 OS 테마 변경을 반영한다', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => expect(systemThemeListener).toBeDefined());

    act(() => {
      systemThemeListener?.({ matches: true } as MediaQueryListEvent);
    });

    expect(screen.getByText('system:dark')).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');
  });
});
