// eslint-disable-next-line import/no-extraneous-dependencies
import { fireEvent, render, screen } from '@testing-library/react';
import { ExploreSearchBar } from './ExploreSearchBar';

const mockUseNavLayout = jest.fn();
const mockSelectRatingRange = jest.fn();
const mockClearRating = jest.fn();
const mockClearWhiskeyFilters = jest.fn();
const mockClearReviewFilters = jest.fn();

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt = '',
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

jest.mock('@/queries/useRegionsQuery', () => ({
  useRegionsQuery: () => ({
    regions: [{ regionId: 0, korName: '전체', engName: 'ALL' }],
  }),
}));

jest.mock('@/components/ui/Layout/NavLayout', () => ({
  useNavLayout: () => mockUseNavLayout(),
}));

jest.mock('../_hooks/useExploreFilters', () => ({
  useExploreFilters: () => ({
    regionIds: [],
    category: '',
    ratingRange: undefined,
    toggleRegionId: jest.fn(),
    clearRegionIds: jest.fn(),
    toggleCategory: jest.fn(),
    clearCategory: jest.fn(),
    selectRatingRange: mockSelectRatingRange,
    clearRating: mockClearRating,
    clearWhiskeyFilters: mockClearWhiskeyFilters,
    clearReviewFilters: mockClearReviewFilters,
  }),
}));

describe('ExploreSearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavLayout.mockReturnValue({ isNavigationVisible: true });
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    document.getElementById('modal')?.remove();
  });

  it('realtime 모드에서는 검색어 추가 버튼 없이 입력 변경을 전달한다', () => {
    const onValueChange = jest.fn();
    const onSearchActiveChange = jest.fn();

    render(
      <ExploreSearchBar
        mode="realtime"
        initialValue="mac"
        onValueChange={onValueChange}
        isSearchActive={false}
        onSearchActiveChange={onSearchActiveChange}
        description="이름이나 플레이버 태그를 입력해 검색해보세요."
        filterTarget="whiskey"
      />,
    );

    const input = screen.getByRole('textbox', { name: '위스키 검색' });
    expect(input).toHaveValue('mac');
    expect(input).toHaveAttribute('placeholder', '키워드를 입력하세요');
    expect(screen.queryByText('+ 검색어 추가')).not.toBeInTheDocument();
    expect(
      screen.getByText('이름이나 플레이버 태그를 입력해 검색해보세요.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('검색 중...')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '필터메뉴' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('explore-search-bar')).toHaveClass(
      'bg-bg-layer-default',
      'text-fg-neutral',
    );
    expect(
      screen.getByText('이름이나 플레이버 태그를 입력해 검색해보세요.'),
    ).toHaveClass('text-fg-neutral-muted');

    fireEvent.change(input, { target: { value: 'macallan' } });
    expect(onValueChange).toHaveBeenCalledWith('macallan');

    fireEvent.focus(input);
    expect(onSearchActiveChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByRole('button', { name: '검색어 지우기' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(onSearchActiveChange).toHaveBeenLastCalledWith(true);

    fireEvent.blur(input);
    expect(onSearchActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('스크롤 방향 상태에 따라 sticky 검색바를 숨기고 다시 노출한다', () => {
    const props = {
      mode: 'realtime' as const,
      initialValue: '',
      onValueChange: jest.fn(),
      isSearchActive: false,
      onSearchActiveChange: jest.fn(),
      description: '검색어를 입력해보세요.',
      filterTarget: 'whiskey' as const,
    };
    const { rerender } = render(<ExploreSearchBar {...props} />);

    const searchBar = screen.getByTestId('explore-search-bar');
    expect(searchBar).toHaveClass(
      'sticky',
      'transition-[transform,opacity,margin-bottom]',
      'scroll-navigation-motion',
      'opacity-100',
    );
    expect(searchBar).toHaveStyle({
      top: 'var(--logo-header-expanded-height)',
      transform: 'translateY(0)',
      marginBottom: '0px',
    });

    mockUseNavLayout.mockReturnValue({ isNavigationVisible: false });
    rerender(<ExploreSearchBar {...props} />);

    expect(searchBar).toHaveClass(
      'pointer-events-none',
      'transition-[transform,opacity,margin-bottom]',
      'scroll-navigation-motion',
      'opacity-0',
    );
    expect(searchBar).toHaveStyle({
      transform: 'translateY(calc(-100% - var(--logo-header-slide-distance)))',
    });

    rerender(<ExploreSearchBar {...props} isSearchActive />);

    expect(searchBar).toHaveClass('pointer-events-auto', 'opacity-100');
    expect(searchBar).toHaveStyle({
      transform: 'translateY(calc(-1 * var(--logo-header-slide-distance)))',
      marginBottom: 'calc(-1 * var(--logo-header-slide-distance))',
    });
  });

  it('리뷰도 검색어 추가 버튼 없이 실시간 입력 변경을 전달한다', () => {
    const onValueChange = jest.fn();

    render(
      <ExploreSearchBar
        mode="realtime"
        initialValue="peaty"
        onValueChange={onValueChange}
        isSearchActive={false}
        onSearchActiveChange={jest.fn()}
        description="리뷰 내용, 플레이버 태그, 작성자, 위스키 이름을 입력해 검색해보세요."
        filterTarget="review"
      />,
    );

    const input = screen.getByRole('textbox', { name: '리뷰 검색' });
    expect(input).toHaveValue('peaty');
    expect(screen.queryByText('+ 검색어 추가')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'smoky' } });
    expect(onValueChange).toHaveBeenCalledWith('smoky');
  });

  it('리뷰 Drawer 최상단에 정렬 preset을 표시하고 선택·초기화를 전달한다', () => {
    const onSelectSort = jest.fn();

    render(
      <ExploreSearchBar
        mode="realtime"
        initialValue=""
        onValueChange={jest.fn()}
        isSearchActive={false}
        onSearchActiveChange={jest.fn()}
        description="리뷰를 검색해보세요."
        filterTarget="review"
        sortPresets={[
          {
            id: 'LATEST_DESC',
            label: '최신순',
            sortType: 'LATEST',
            sortOrder: 'DESC',
          },
          {
            id: 'POPULAR_DESC',
            label: '인기순',
            sortType: 'POPULAR',
            sortOrder: 'DESC',
          },
        ]}
        selectedSortId="LATEST_DESC"
        onSelectSort={onSelectSort}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '필터메뉴' }));

    const sortHeading = screen.getByText('정렬');
    const ratingHeading = screen.getByText('별점');
    expect(
      sortHeading.compareDocumentPosition(ratingHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: '최신순' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('별점 전체')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '0.5점' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5.0점' })).toBeInTheDocument();
    expect(screen.queryByText('카테고리')).not.toBeInTheDocument();
    expect(screen.queryByText('지역')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '인기순' }));
    expect(onSelectSort).toHaveBeenCalledWith('POPULAR_DESC');

    fireEvent.click(screen.getByRole('button', { name: '2.5점' }));
    expect(mockSelectRatingRange).toHaveBeenCalledWith(2.5, 2.5);

    fireEvent.click(screen.getByRole('button', { name: '초기화' }));
    expect(mockClearReviewFilters).toHaveBeenCalledTimes(1);
  });
});
