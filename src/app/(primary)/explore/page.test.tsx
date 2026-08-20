// eslint-disable-next-line import/no-extraneous-dependencies
import { fireEvent, render, screen } from '@testing-library/react';
import ExplorePage from './page';

const mockUseNavLayout = jest.fn();
const mockSetNavbarSuppressed = jest.fn();
const mockSetTabParam = jest.fn();
const mockRouterReplace = jest.fn();
let mockCurrentTab = {
  name: '리뷰 둘러보기',
  id: 'REVIEW_WHISKEY',
};

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
    currentTab: mockCurrentTab,
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

jest.mock('@/components/ui/Navigation/AutoHideLogoHeader', () => ({
  __esModule: true,
  default: ({ isVisible = true }: { isVisible?: boolean }) => (
    <div data-testid="explore-logo-row" data-visible={String(isVisible)} />
  ),
}));

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
    mockCurrentTab = {
      name: '리뷰 둘러보기',
      id: 'REVIEW_WHISKEY',
    };
    mockUseNavLayout.mockReturnValue({
      isNavigationVisible: true,
      setNavbarSuppressed: mockSetNavbarSuppressed,
    });
  });

  it('스크롤 상단에서는 BottleNote 로고 영역을 표시한다', () => {
    render(<ExplorePage />);

    expect(screen.getByTestId('explore-page')).toHaveClass(
      'bg-bg-layer-default',
      'text-fg-neutral',
    );
    expect(screen.getByTestId('explore-page')).toHaveAttribute(
      'data-header-collapsed',
      'false',
    );
    expect(screen.getByTestId('explore-logo-row')).toBeInTheDocument();
    expect(screen.getByTestId('explore-logo-row')).toHaveAttribute(
      'data-visible',
      'true',
    );
  });

  it('초기 진입은 스크롤을 유지하고 실제 탭 변경만 상단으로 이동한다', () => {
    const { rerender } = render(<ExplorePage />);

    expect(window.scrollTo).not.toHaveBeenCalled();

    mockCurrentTab = {
      name: '위스키 둘러보기',
      id: 'EXPLORER_WHISKEY',
    };
    rerender(<ExplorePage />);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('아래로 스크롤하면 BottleNote 로고 영역을 접고 탭만 유지한다', () => {
    mockUseNavLayout.mockReturnValue({
      isNavigationVisible: false,
      setNavbarSuppressed: mockSetNavbarSuppressed,
    });

    render(<ExplorePage />);

    expect(screen.getByTestId('explore-page')).toHaveAttribute(
      'data-header-collapsed',
      'true',
    );
    expect(screen.getByTestId('explore-logo-row')).toHaveAttribute(
      'data-visible',
      'false',
    );
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
    expect(screen.getByTestId('explore-logo-row')).toHaveAttribute(
      'data-visible',
      'false',
    );
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
