// eslint-disable-next-line import/no-extraneous-dependencies
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import ExplorePage from './page';

const mockUseNavLayout = jest.fn();
const mockSetNavbarSuppressed = jest.fn();
const mockSetTabParam = jest.fn();
const mockRouterReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('tab=REVIEW_WHISKEY'),
  useRouter: () => ({ replace: mockRouterReplace }),
}));

jest.mock('@/hooks/useStatefulSearchParams', () => ({
  __esModule: true,
  default: () => [null, mockSetTabParam],
}));

jest.mock('@/hooks/useTab', () => ({
  useTab: () => ({
    currentTab: { name: '리뷰 둘러보기', id: 'REVIEW_WHISKEY' },
    handleTab: jest.fn(),
    refs: { scrollContainerRef: { current: null } },
    registerTab: jest.fn(),
  }),
}));

jest.mock('@/components/ui/Layout/NavLayout', () => ({
  useNavLayout: () => mockUseNavLayout(),
}));

jest.mock('@/components/ui/Navigation/Tab', () => ({
  __esModule: true,
  default: () => <div data-testid="explore-tabs">tabs</div>,
}));

jest.mock('@/components/ui/Navigation/SubHeader', () => {
  const SubHeader = Object.assign(
    ({ children }: { children?: ReactNode }) => (
      <div data-testid="explore-logo-row">{children}</div>
    ),
    {
      Left: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
      Right: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
      Logo: () => <div>BottleNote Logo</div>,
      Menu: () => <div>Menu</div>,
    },
  );

  return { SubHeader };
});

jest.mock('./_components/ReviewExploreList', () => ({
  ReviewExplorerList: ({
    onSearchActiveChange,
  }: {
    onSearchActiveChange: (active: boolean) => void;
  }) => (
    <div>
      review list
      <button type="button" onClick={() => onSearchActiveChange(true)}>
        focus review search
      </button>
      <button type="button" onClick={() => onSearchActiveChange(false)}>
        blur review search
      </button>
    </div>
  ),
}));

jest.mock('./_components/WhiskeyExploreList', () => ({
  WhiskeyExplorerList: () => <div>whiskey list</div>,
}));

describe('ExplorePage scroll header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.scrollTo = jest.fn();
    mockUseNavLayout.mockReturnValue({
      isScrollVisible: true,
      setNavbarSuppressed: mockSetNavbarSuppressed,
    });
  });

  it('스크롤 상단에서는 BottleNote 로고 영역을 표시한다', () => {
    render(<ExplorePage />);

    expect(screen.getByTestId('explore-page')).toHaveAttribute(
      'data-header-collapsed',
      'false',
    );
    expect(screen.getByTestId('explore-logo-row')).toBeInTheDocument();
  });

  it('아래로 스크롤하면 BottleNote 로고 영역을 접고 탭만 유지한다', () => {
    mockUseNavLayout.mockReturnValue({
      isScrollVisible: false,
      setNavbarSuppressed: mockSetNavbarSuppressed,
    });

    render(<ExplorePage />);

    expect(screen.getByTestId('explore-page')).toHaveAttribute(
      'data-header-collapsed',
      'true',
    );
    expect(screen.queryByTestId('explore-logo-row')).not.toBeInTheDocument();
    expect(screen.getByTestId('explore-tabs')).toBeInTheDocument();
  });

  it('리뷰 검색 focus도 헤더를 접고 Navbar를 suppression한다', () => {
    render(<ExplorePage />);

    fireEvent.click(
      screen.getByRole('button', { name: 'focus review search' }),
    );

    expect(screen.getByTestId('explore-page')).toHaveAttribute(
      'data-search-active',
      'true',
    );
    expect(screen.getByTestId('explore-page')).toHaveAttribute(
      'data-header-collapsed',
      'true',
    );
    expect(screen.queryByTestId('explore-logo-row')).not.toBeInTheDocument();
    expect(mockSetNavbarSuppressed).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByRole('button', { name: 'blur review search' }));

    expect(screen.getByTestId('explore-page')).toHaveAttribute(
      'data-search-active',
      'false',
    );
    expect(mockSetNavbarSuppressed).toHaveBeenLastCalledWith(false);
  });

  it('focus 상태에서 route unmount 시 Navbar suppression을 해제한다', () => {
    const { unmount } = render(<ExplorePage />);

    fireEvent.click(
      screen.getByRole('button', { name: 'focus review search' }),
    );
    expect(mockSetNavbarSuppressed).toHaveBeenLastCalledWith(true);

    unmount();

    expect(mockSetNavbarSuppressed).toHaveBeenLastCalledWith(false);
  });
});
