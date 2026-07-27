import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeProvider';

const mockSystemTheme = (isDarkMode: boolean) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: isDarkMode && query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

const ThemeConsumer = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <span>{theme}</span>
      <button type="button" onClick={toggleTheme}>
        테마 전환
      </button>
    </>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockSystemTheme(false);
  });

  it('저장된 테마가 없으면 시스템 라이트 모드를 따른다', async () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(window.matchMedia).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)',
      );
      expect(screen.getByText('light')).toBeInTheDocument();
      expect(
        container.querySelector('[data-theme="light"]'),
      ).toBeInTheDocument();
    });
  });

  it('저장된 테마가 없으면 시스템 다크 모드를 따른다', async () => {
    mockSystemTheme(true);

    const { container } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('dark')).toBeInTheDocument();
      expect(
        container.querySelector('[data-theme="dark"]'),
      ).toBeInTheDocument();
    });
  });

  it('저장된 다크 모드를 복원한다', async () => {
    window.localStorage.setItem('bottle-note-theme', 'dark');

    const { container } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('dark')).toBeInTheDocument();
      expect(
        container.querySelector('[data-theme="dark"]'),
      ).toBeInTheDocument();
    });
  });

  it('저장된 라이트 모드는 시스템 다크 모드보다 우선한다', async () => {
    mockSystemTheme(true);
    window.localStorage.setItem('bottle-note-theme', 'light');

    const { container } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('light')).toBeInTheDocument();
      expect(
        container.querySelector('[data-theme="light"]'),
      ).toBeInTheDocument();
    });
    expect(window.matchMedia).not.toHaveBeenCalled();
  });

  it('테마를 전환하고 선택값을 저장한다', () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '테마 전환' }));

    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(container.querySelector('.dark')).toBeInTheDocument();
    expect(window.localStorage.getItem('bottle-note-theme')).toBe('dark');
  });
});
