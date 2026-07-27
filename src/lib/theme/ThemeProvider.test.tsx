import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeProvider';

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
  });

  it('저장된 테마가 없으면 라이트 모드로 시작한다', () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByText('light')).toBeInTheDocument();
    expect(container.querySelector('[data-theme="light"]')).toBeInTheDocument();
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
