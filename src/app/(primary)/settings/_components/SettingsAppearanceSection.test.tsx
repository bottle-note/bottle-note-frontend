import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { SettingsAppearanceSection } from './SettingsAppearanceSection';

describe('SettingsAppearanceSection', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('설정 화면에서 다크 모드를 전환한다', () => {
    const { container } = render(
      <ThemeProvider>
        <SettingsAppearanceSection />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '다크 모드 꺼짐' }));

    expect(
      screen.getByRole('button', { name: '다크 모드 켜짐' }),
    ).toBeInTheDocument();
    expect(container.querySelector('[data-theme="dark"]')).toBeInTheDocument();
  });
});
