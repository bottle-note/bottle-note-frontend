// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen, within } from '@testing-library/react';
import { ExploreApi } from '@/api/explore/explore.api';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ReviewExplorerList } from './ReviewExploreList';

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
  useAuthSession: () => ({ user: { userId: 1 } }),
}));

jest.mock('../_hooks/useExploreKeywords', () => ({
  useExploreKeywords: () => ({
    keywords: [],
    keywordValues: [],
    handleAddKeyword: jest.fn(),
    handleRemoveKeyword: jest.fn(),
  }),
}));

jest.mock('../_hooks/useExploreFilters', () => ({
  useExploreFilters: () => ({ rating: 3.5 }),
}));

jest.mock('./ExploreSearchBar', () => ({
  ExploreSearchBar: ({ filterTarget }: { filterTarget: string }) => (
    <div data-filter-target={filterTarget}>review-search</div>
  ),
}));

jest.mock('./ExploreKeywordChip', () => ({
  ExploreKeywordChip: () => <div>keyword</div>,
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

describe('ReviewExplorerList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('작성 별점을 query key와 리뷰 API의 동일한 상하한으로 전달한다', async () => {
    mockUsePaginatedQuery.mockReturnValue({
      data: [{ data: { items: [] } }],
      isLoading: false,
      isFetching: false,
      targetRef: { current: null },
      error: null,
      refetch: jest.fn(),
    });

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

    const [config] = mockUsePaginatedQuery.mock.calls[0];
    expect(config.queryKey).toEqual(['explore.reviews', 1, 3.5]);

    const controller = new AbortController();
    await config.queryFn({
      pageParam: 'opaque-review-cursor',
      signal: controller.signal,
    });

    expect(mockGetReviews).toHaveBeenCalledWith({
      keywords: [],
      ratingFrom: 3.5,
      ratingTo: 3.5,
      cursor: 'opaque-review-cursor',
      size: 10,
      signal: controller.signal,
    });
  });

  it('결과가 많아도 현재 화면 주변의 리뷰만 DOM에 표시한다', () => {
    const items = Array.from({ length: 100 }, (_, index) => ({
      reviewId: index + 1,
    }));
    mockUsePaginatedQuery.mockReturnValue({
      data: [{ data: { items } }],
      isLoading: false,
      isFetching: false,
      targetRef: { current: null },
      error: null,
      refetch: jest.fn(),
    });

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
