// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen, within } from '@testing-library/react';
import { ExploreApi } from '@/api/explore/explore.api';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ReviewExplorerList } from './ReviewExploreList';
import { useExploreFilters } from '../_hooks/useExploreFilters';
import { useExploreSearch } from '../_hooks/useExploreSearch';
import { useExploreSort } from '../_hooks/useExploreSort';

const mockSetQueryData = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/explore',
  useSearchParams: () => new URLSearchParams('tab=REVIEW_WHISKEY'),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ setQueryData: mockSetQueryData }),
}));

jest.mock('@tanstack/react-virtual', () => ({
  useWindowVirtualizer: ({
    count,
    estimateSize,
    getItemKey,
  }: {
    count: number;
    estimateSize: () => number;
    getItemKey: (index: number) => React.Key;
  }) => {
    const size = estimateSize();

    return {
      getTotalSize: () => count * size,
      getVirtualItems: () =>
        Array.from({ length: Math.min(count, 8) }, (_, index) => ({
          index,
          key: getItemKey(index),
          size,
          start: index * size,
        })),
      measureElement: jest.fn(),
      takeSnapshot: () => [],
    };
  },
}));

jest.mock('@/queries/usePaginatedQuery', () => ({
  usePaginatedQuery: jest.fn(),
}));

jest.mock('@/api/explore/explore.api', () => ({
  ExploreApi: { getReviews: jest.fn() },
}));

jest.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: () => ({
    isLoggedIn: true,
    isLoading: false,
    user: { userId: 1 },
  }),
}));

jest.mock('../_hooks/useExploreFilters', () => ({
  useExploreFilters: jest.fn(),
}));

jest.mock('../_hooks/useExploreSearch', () => ({
  useExploreSearch: jest.fn(),
}));

jest.mock('../_hooks/useExploreSort', () => ({
  useExploreSort: jest.fn(),
}));

jest.mock('./ExploreSearchBar', () => ({
  ExploreSearchBar: ({
    filterTarget,
    initialValue,
  }: {
    filterTarget: string;
    initialValue: string;
  }) => (
    <div data-filter-target={filterTarget} data-initial-value={initialValue}>
      review-search
    </div>
  ),
}));

jest.mock('./ReviewListItem', () => {
  const MockReviewListItem = ({
    content,
  }: {
    content: { reviewId: number };
  }) => <article>{`review-${content.reviewId}`}</article>;

  return { __esModule: true, default: MockReviewListItem };
});

const mockUsePaginatedQuery = usePaginatedQuery as jest.Mock;
const mockGetReviews = ExploreApi.getReviews as jest.Mock;
const mockUseExploreFilters = useExploreFilters as jest.Mock;
const mockUseExploreSearch = useExploreSearch as jest.Mock;
const mockUseExploreSort = useExploreSort as jest.Mock;

const setupPaginatedQuery = (items: { reviewId: number }[]) => {
  mockUsePaginatedQuery.mockReturnValue({
    data: [{ data: { items } }],
    isLoading: false,
    isFetching: false,
    isFetchingNextPage: false,
    isPlaceholderData: false,
    hasNextPage: true,
    targetRef: { current: null },
    error: null,
  });
};

describe('ReviewExplorerList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExploreFilters.mockReturnValue({
      ratingPreset: {
        id: 'AT_MOST_2_5',
        label: '2.5점 이하',
        ratingFrom: 0.5,
        ratingTo: 2.5,
      },
    });
    mockUseExploreSearch.mockReturnValue({
      inputKeyword: 'peaty',
      debouncedKeyword: 'peaty',
      isTyping: false,
      setInputKeyword: jest.fn(),
    });
    mockUseExploreSort.mockReturnValue({
      sortPresets: [],
      selectedSort: {
        id: 'RATING_ASC',
        label: '별점 낮은순',
        sortType: 'RATING',
        sortOrder: 'ASC',
      },
      selectSort: jest.fn(),
    });
  });

  it('단일 검색어·정렬·별점을 query key와 리뷰 API 요청에 전달한다', async () => {
    setupPaginatedQuery([]);

    render(
      <ReviewExplorerList
        isSearchActive={false}
        onSearchActiveChange={jest.fn()}
      />,
    );

    expect(screen.getByText('review-search')).toHaveAttribute(
      'data-filter-target',
      'review',
    );
    expect(screen.getByText('review-search')).toHaveAttribute(
      'data-initial-value',
      'peaty',
    );

    const [config] = mockUsePaginatedQuery.mock.calls[0];
    expect(config.queryKey).toEqual([
      'explore.reviews',
      1,
      'AT_MOST_2_5',
      'peaty',
      'RATING',
      'ASC',
      10,
    ]);

    const controller = new AbortController();
    await config.queryFn({
      pageParam: 'opaque-review-cursor',
      signal: controller.signal,
    });

    expect(mockGetReviews).toHaveBeenCalledWith({
      keyword: 'peaty',
      sortType: 'RATING',
      sortOrder: 'ASC',
      ratingFrom: 0.5,
      ratingTo: 2.5,
      cursor: 'opaque-review-cursor',
      size: 10,
      signal: controller.signal,
    });
  });

  it('결과가 많아도 현재 화면 주변의 리뷰만 DOM에 표시한다', () => {
    const items = Array.from({ length: 100 }, (_, index) => ({
      reviewId: index + 1,
    }));
    setupPaginatedQuery(items);

    render(
      <ReviewExplorerList
        isSearchActive={false}
        onSearchActiveChange={jest.fn()}
      />,
    );

    const list = screen.getByRole('list', { name: '리뷰 목록' });
    const visibleItems = within(list).getAllByRole('listitem');

    expect(visibleItems).toHaveLength(8);
    expect(visibleItems[0]).toHaveAttribute('aria-posinset', '1');
    expect(visibleItems[0]).toHaveAttribute('aria-setsize', '100');
    expect(within(list).getByText('review-1')).toBeInTheDocument();
    expect(within(list).queryByText('review-100')).not.toBeInTheDocument();
  });
});
