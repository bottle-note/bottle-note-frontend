import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { SettingsAppearanceSection } from './SettingsAppearanceSection';

jest.mock('@/components/ui/Modal/BottomSheet', () => ({
  __esModule: true,
  default: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <div role="dialog">{children}</div> : null,
}));

describe('SettingsAppearanceSection', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('화면 모드 시트에서 다크 모드를 선택하고 선택값을 저장한다', async () => {
    render(
      <ThemeProvider>
        <SettingsAppearanceSection />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /^화면 모드/ }));
    fireEvent.click(screen.getByRole('radio', { name: /다크 모드/ }));

    await waitFor(() => {
      expect(window.localStorage.getItem('bottle-note-theme')).toBe('dark');
      expect(document.documentElement).toHaveClass('dark');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
