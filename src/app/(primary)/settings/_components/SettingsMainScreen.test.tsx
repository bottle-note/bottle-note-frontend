import { render, screen } from '@testing-library/react';
import { MenuCategory } from '@/types/Settings';
import { SettingsMainScreen } from './SettingsMainScreen';

const publicMenuCategories: MenuCategory[] = [
  {
    title: '기타',
    items: [
      {
        text: '화면 테마',
        action: jest.fn(),
      },
      {
        text: '로그인 관리',
        action: jest.fn(),
      },
    ],
  },
];

describe('SettingsMainScreen', () => {
  it('비로그인 상태에서는 미니 이벤트를 노출하지 않는다', () => {
    render(
      <SettingsMainScreen
        menuCategories={publicMenuCategories}
        isLoggedIn={false}
      />,
    );

    expect(
      screen.getByRole('button', { name: '화면 테마' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '로그인 관리' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '위스키 타로' }),
    ).not.toBeInTheDocument();
  });

  it('로그인 상태에서는 미니 이벤트를 노출한다', () => {
    render(
      <SettingsMainScreen menuCategories={publicMenuCategories} isLoggedIn />,
    );

    expect(
      screen.getByRole('link', { name: '위스키 타로' }),
    ).toBeInTheDocument();
  });
});
