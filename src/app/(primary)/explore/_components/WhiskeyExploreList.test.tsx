// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen, within } from '@testing-library/react';
import { ExploreApi } from '@/api/explore/explore.api';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import useModalStore from '@/store/modalStore';
import { ROUTES } from '@/constants/routes';
import type { LinkData } from '@/types/LinkButton';
import { WhiskeyExplorerList } from './WhiskeyExploreList';
import { useExploreFilters } from '../_hooks/useExploreFilters';
import { useWhiskeyExploreSearch } from '../_hooks/useWhiskeyExploreSearch';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

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

jest.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: jest.fn(),
}));

jest.mock('@/store/modalStore', () => ({
  __esModule: true,
  default: jest.fn(),
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
        Array.from({ length: Math.min(count, 10) }, (_, index) => ({
          index,
          key: getItemKey(index),
          size,
          start: index * size,
        })),
      measureElement: jest.fn(),
    };
  },
}));

jest.mock('@/components/ui/Button/PrimaryLinkButton', () => ({
  __esModule: true,
  default: ({ data }: { data: LinkData }) => {
    const href =
      typeof data.linkSrc === 'string' ? data.linkSrc : data.linkSrc.pathname;

    return (
      <a href={href} onClick={data.handleBeforeRouteChange}>
        {data.korName}
      </a>
    );
  },
}));

jest.mock('./ExploreSearchBar', () => ({
  ExploreSearchBar: ({
    mode,
    onSearchActiveChange,
  }: {
    mode: string;
    onSearchActiveChange: (active: boolean) => void;
  }) => (
    <div>
      <div data-testid="search-mode">{mode}</div>
      <button type="button" onClick={() => onSearchActiveChange(true)}>
        focus search
      </button>
    </div>
  ),
}));

jest.mock('./WhiskeyListItem', () => {
  const MockWhiskeyListItem = ({
    content,
  }: {
    content: { alcoholId: number };
  }) => <div>{`whiskey-${content.alcoholId}`}</div>;
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
const mockUseAuth = useAuthSession as jest.Mock;
const mockUseModalStore = useModalStore as unknown as jest.Mock;

const mockHandleModalState = jest.fn();
const mockHandleCloseModal = jest.fn();
const mockHandleLoginState = jest.fn();

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
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      user: { userId: 101 },
    });
    mockUseModalStore.mockReturnValue({
      handleModalState: mockHandleModalState,
      handleCloseModal: mockHandleCloseModal,
      handleLoginState: mockHandleLoginState,
    });
    mockUsePaginatedQuery.mockReturnValue({
      data: [{ data: { items: [{ alcoholId: 1 }] } }],
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      isPlaceholderData: false,
      hasNextPage: true,
      targetRef: { current: null },
      error: null,
    });
  });

  it('단일 debounce 검색어와 필터를 query key 및 API 요청에 사용한다', async () => {
    const onSearchActiveChange = jest.fn();
    render(
      <WhiskeyExplorerList
        isSearchActive={false}
        onSearchActiveChange={onSearchActiveChange}
      />,
    );

    expect(screen.getByTestId('search-mode')).toHaveTextContent('realtime');
    expect(screen.getByTestId('whiskey-list')).toHaveAttribute(
      'data-empty-view-text',
      '조건에 맞는 위스키가 없어요.',
    );
    expect(screen.queryByText('+ 검색어 추가')).not.toBeInTheDocument();

    screen.getByRole('button', { name: 'focus search' }).click();
    expect(onSearchActiveChange).toHaveBeenCalledWith(true);

    const [config] = mockUsePaginatedQuery.mock.calls[0];
    expect(config.queryKey).toEqual([
      'explore.alcohols',
      'SINGLE_MALT',
      '12',
      'macallan',
      101,
    ]);
    expect(config.keepPreviousData).toBeUndefined();

    const controller = new AbortController();
    const opaqueCursor = 'opaque.cursor_-with-specials';
    await config.queryFn({
      pageParam: opaqueCursor,
      signal: controller.signal,
    });

    expect(mockGetAlcohols).toHaveBeenCalledWith({
      keywords: ['macallan'],
      regionIds: [12],
      category: 'SINGLE_MALT',
      sortType: 'POPULAR',
      sortOrder: 'DESC',
      cursor: opaqueCursor,
      size: 10,
      signal: controller.signal,
    });
  });

  it('viewer가 변경되면 개인화 목록에 별도 query key를 사용한다', () => {
    const { rerender } = render(
      <WhiskeyExplorerList
        isSearchActive={false}
        onSearchActiveChange={jest.fn()}
      />,
    );

    expect(mockUsePaginatedQuery.mock.calls.at(-1)?.[0].queryKey).toContain(
      101,
    );

    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      user: { userId: 202 },
    });
    rerender(
      <WhiskeyExplorerList
        isSearchActive={false}
        onSearchActiveChange={jest.fn()}
      />,
    );

    expect(mockUsePaginatedQuery.mock.calls.at(-1)?.[0].queryKey).toContain(
      202,
    );
  });

  it('검색 결과가 없으면 위스키 추가 문의 버튼을 노출한다', () => {
    mockUsePaginatedQuery.mockReturnValue({
      data: [{ data: { items: [] } }],
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      isPlaceholderData: false,
      hasNextPage: false,
      targetRef: { current: null },
      error: null,
    });

    render(
      <WhiskeyExplorerList
        isSearchActive={false}
        onSearchActiveChange={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('link', { name: '혹시 찾는 술이 없으신가요?' }),
    ).toBeInTheDocument();
  });

  it('위스키 리스트의 마지막 페이지에 도달하면 문의 버튼을 노출한다', () => {
    mockUsePaginatedQuery.mockReturnValue({
      data: [{ data: { items: [{ alcoholId: 1 }] } }],
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      isPlaceholderData: false,
      hasNextPage: false,
      targetRef: { current: null },
      error: null,
    });

    render(
      <WhiskeyExplorerList
        isSearchActive={false}
        onSearchActiveChange={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('link', { name: '혹시 찾는 술이 없으신가요?' }),
    ).toBeInTheDocument();
  });

  it('다음 페이지가 남아 있으면 문의 버튼을 노출하지 않는다', () => {
    render(
      <WhiskeyExplorerList
        isSearchActive={false}
        onSearchActiveChange={jest.fn()}
      />,
    );

    expect(
      screen.queryByRole('link', { name: '혹시 찾는 술이 없으신가요?' }),
    ).not.toBeInTheDocument();
  });

  it('결과가 많아도 현재 화면 주변의 위스키만 DOM에 표시한다', () => {
    const items = Array.from({ length: 100 }, (_, index) => ({
      alcoholId: index + 1,
    }));
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

    render(
      <WhiskeyExplorerList
        isSearchActive={false}
        onSearchActiveChange={jest.fn()}
      />,
    );

    const list = screen.getByRole('list', { name: '위스키 목록' });
    const visibleItems = within(list).getAllByRole('listitem');

    expect(visibleItems.length).toBeGreaterThan(0);
    expect(visibleItems.length).toBeLessThan(items.length);
    expect(visibleItems[0]).toHaveAttribute('aria-posinset', '1');
    expect(visibleItems[0]).toHaveAttribute('aria-setsize', '100');
    expect(within(list).getByText('whiskey-1')).toBeInTheDocument();
    expect(within(list).queryByText('whiskey-100')).not.toBeInTheDocument();
  });

  it('문의 버튼에서 기존 위스키 추가 요청 확인 흐름을 실행한다', () => {
    mockUsePaginatedQuery.mockReturnValue({
      data: [{ data: { items: [] } }],
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      isPlaceholderData: false,
      hasNextPage: false,
      targetRef: { current: null },
      error: null,
    });

    render(
      <WhiskeyExplorerList
        isSearchActive={false}
        onSearchActiveChange={jest.fn()}
      />,
    );

    screen.getByRole('link', { name: '혹시 찾는 술이 없으신가요?' }).click();

    expect(mockHandleModalState).toHaveBeenCalledWith(
      expect.objectContaining({
        isShowModal: true,
        type: 'CONFIRM',
        mainText: '위스키 추가 요청을 하겠습니까?',
      }),
    );

    const modalState = mockHandleModalState.mock.calls[0][0];
    modalState.handleConfirm();

    expect(mockHandleCloseModal).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(ROUTES.INQUIRE.REGISTER);
  });

  it('비로그인 문의 요청은 로그인 후 문의 등록으로 이동할 returnTo를 지정한다', () => {
    mockUseAuth.mockReturnValue({ isLoggedIn: false });
    mockUsePaginatedQuery.mockReturnValue({
      data: [{ data: { items: [] } }],
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      isPlaceholderData: false,
      hasNextPage: false,
      targetRef: { current: null },
      error: null,
    });

    render(
      <WhiskeyExplorerList
        isSearchActive={false}
        onSearchActiveChange={jest.fn()}
      />,
    );

    screen.getByRole('link', { name: '혹시 찾는 술이 없으신가요?' }).click();
    const modalState = mockHandleModalState.mock.calls[0][0];
    modalState.handleConfirm();

    expect(mockHandleCloseModal).toHaveBeenCalled();
    expect(mockHandleLoginState).toHaveBeenCalledWith(
      true,
      ROUTES.INQUIRE.REGISTER,
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
