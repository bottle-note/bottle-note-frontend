// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import User from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/api/user/user.api', () => ({
  UserApi: {
    getUserInfo: jest.fn(() => new Promise(() => {})),
  },
}));

jest.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: () => ({ user: null, isLoggedIn: false }),
}));

jest.mock('@/store/modalStore', () => ({
  __esModule: true,
  default: () => ({
    handleModalState: jest.fn(),
    handleLoginModal: jest.fn(),
  }),
}));

jest.mock('@/queries/usePaginatedQuery', () => ({
  usePaginatedQuery: () => ({
    data: undefined,
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/components/ui/Layout/NavLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/Navigation/SubHeader', () => {
  const SubHeader = Object.assign(
    ({ children }: { children: ReactNode }) => <header>{children}</header>,
    {
      Left: ({ children }: { children: ReactNode }) => <div>{children}</div>,
      Right: ({ children }: { children: ReactNode }) => <div>{children}</div>,
      Logo: () => <span>logo</span>,
      Menu: () => <span>menu</span>,
    },
  );

  return { SubHeader };
});

jest.mock('@/components/domain/history/TimelinePreview', () => ({
  __esModule: true,
  default: () => <div>timeline</div>,
}));

jest.mock('@/components/ui/Button/PrimaryLinkButton', () => ({
  __esModule: true,
  default: () => <div>history link</div>,
}));

jest.mock('./_components/UserInfo', () => ({
  __esModule: true,
  default: () => <div>user info</div>,
}));

jest.mock('./_components/HistoryOverview', () => ({
  __esModule: true,
  default: () => <div>history overview</div>,
}));

describe('User profile page', () => {
  it('프로필 화면의 기본 표면과 글자에 시맨틱 색상 토큰을 사용한다', () => {
    render(<User params={{ id: '6' }} />);

    expect(screen.getByTestId('user-profile-page')).toHaveClass(
      'bg-bg-layer-default',
      'text-fg-neutral',
    );
  });
});
