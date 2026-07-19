// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import { ExploreApi } from '@/api/explore/explore.api';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { WhiskeyExplorerList } from './WhiskeyExploreList';
import { useExploreFilters } from '../_hooks/useExploreFilters';
import { useWhiskeyExploreSearch } from '../_hooks/useWhiskeyExploreSearch';

jest.mock('@/api/explore/explore.api', () => ({
  ExploreApi: { getAlcohols: jest.fn() },
}));

jest.mock('@/queries/usePaginatedQuery', () => ({
  usePaginatedQuery: jest.fn(),
}));

jest.mock('../_hooks/useExploreFilters', () => ({
  useExploreFilters: jest.fn(),
}));

jest.mock('../_hooks/useWhiskeyExploreSearch', () => ({
  useWhiskeyExploreSearch: jest.fn(),
}));

jest.mock('./ExploreSearchBar', () => ({
  ExploreSearchBar: ({ mode }: { mode: string }) => (
    <div data-testid="search-mode">{mode}</div>
  ),
}));

jest.mock('./WhiskeyListItem', () => {
  const MockWhiskeyListItem = () => <div>whiskey</div>;
  return { __esModule: true, default: MockWhiskeyListItem };
});

jest.mock('@/components/feature/List/List', () => {
  const MockList = ({
    children,
    emptyViewText,
  }: {
    children: React.ReactNode;
    emptyViewText?: string;
  }) => (
    <div data-empty-view-text={emptyViewText} data-testid="whiskey-list">
      {children}
    </div>
  );
  const MockListSection = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  MockList.Section = MockListSection;
  return { __esModule: true, default: MockList };
});

const mockUsePaginatedQuery = usePaginatedQuery as jest.Mock;
const mockUseExploreFilters = useExploreFilters as jest.Mock;
const mockUseWhiskeyExploreSearch = useWhiskeyExploreSearch as jest.Mock;
const mockGetAlcohols = ExploreApi.getAlcohols as jest.Mock;

describe('WhiskeyExplorerList realtime search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWhiskeyExploreSearch.mockReturnValue({
      inputKeyword: 'macallan',
      debouncedKeyword: 'macallan',
      isTyping: false,
      setInputKeyword: jest.fn(),
    });
    mockUseExploreFilters.mockReturnValue({
      regionIds: [12],
      category: 'SINGLE_MALT',
    });
    mockUsePaginatedQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      isPlaceholderData: false,
      targetRef: { current: null },
      error: null,
    });
  });

  it('단일 debounce 검색어와 필터를 query key 및 API 요청에 사용한다', async () => {
    render(<WhiskeyExplorerList />);

    expect(screen.getByTestId('search-mode')).toHaveTextContent('realtime');
    expect(screen.getByTestId('whiskey-list')).toHaveAttribute(
      'data-empty-view-text',
      '조건에 맞는 위스키가 없어요.',
    );
    expect(screen.queryByText('+ 검색어 추가')).not.toBeInTheDocument();

    const [config] = mockUsePaginatedQuery.mock.calls[0];
    expect(config.queryKey).toEqual([
      'explore.alcohols',
      'SINGLE_MALT',
      '12',
      'macallan',
    ]);
    expect(config.keepPreviousData).toBe(true);

    const controller = new AbortController();
    await config.queryFn({ pageParam: 37, signal: controller.signal });

    expect(mockGetAlcohols).toHaveBeenCalledWith({
      keywords: ['macallan'],
      regionIds: [12],
      category: 'SINGLE_MALT',
      sortType: 'POPULAR',
      sortOrder: 'DESC',
      cursor: 37,
      pageSize: 10,
      signal: controller.signal,
    });
  });
});
