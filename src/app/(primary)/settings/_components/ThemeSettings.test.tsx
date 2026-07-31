import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { THEME_STORAGE_KEY } from '@/lib/theme/theme';
import ThemeSettings from './ThemeSettings';

describe('ThemeSettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: jest.fn(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('시스템·라이트·다크 선택지를 제공하고 선택한 테마를 즉시 적용한다', async () => {
    render(
      <ThemeProvider>
        <ThemeSettings />
      </ThemeProvider>,
    );

    const systemOption = screen.getByRole('radio', {
      name: /시스템 설정/,
    });
    const darkOption = screen.getByRole('radio', {
      name: /^다크 모드/,
    });

    await waitFor(() => {
      expect(systemOption).toBeEnabled();
    });
    expect(systemOption).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(darkOption);

    expect(darkOption).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement).toHaveClass('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(screen.queryByText(/현재 적용:/)).not.toBeInTheDocument();
  });
});
