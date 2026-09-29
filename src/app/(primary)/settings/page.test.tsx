import { render, screen } from '@testing-library/react';
import SettingsPage, { dynamic } from './page';

jest.mock('./SettingsClient', () => ({
  __esModule: true,
  default: ({
    showNotificationSettings,
  }: {
    showNotificationSettings: boolean;
  }) => (
    <span>{showNotificationSettings ? 'menu-visible' : 'menu-hidden'}</span>
  ),
}));

describe('settings page runtime environment', () => {
  const originalServerUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  afterEach(() => {
    if (originalServerUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SERVER_URL;
    } else {
      process.env.NEXT_PUBLIC_SERVER_URL = originalServerUrl;
    }
  });

  it('요청 시점의 개발 API 환경에서만 메뉴 노출값을 전달한다', () => {
    expect(dynamic).toBe('force-dynamic');
    process.env.NEXT_PUBLIC_SERVER_URL =
      'https://api.development.bottle-note.com';
    const { rerender } = render(<SettingsPage />);
    expect(screen.getByText('menu-visible')).toBeTruthy();

    process.env.NEXT_PUBLIC_SERVER_URL = 'https://api.bottle-note.com';
    rerender(<SettingsPage />);
    expect(screen.getByText('menu-hidden')).toBeTruthy();
  });
});
