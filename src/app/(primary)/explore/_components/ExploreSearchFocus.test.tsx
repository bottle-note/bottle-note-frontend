// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen, waitFor } from '@testing-library/react';
import TabbedListPageHeader, {
  useTabbedListPageSearch,
} from '@/components/feature/TabbedListPage/TabbedListPageHeader';
import { ExploreSearchBar } from './ExploreSearchBar';

const mockSetNavbarSuppressed = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/ui/Layout/NavLayout', () => ({
  useNavLayout: () => ({
    isNavigationVisible: true,
    setNavbarSuppressed: mockSetNavbarSuppressed,
  }),
}));

jest.mock('@/components/ui/Navigation/AutoHideLogoHeader', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/ui/Navigation/Tab', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/queries/useRegionsQuery', () => ({
  useRegionsQuery: () => ({
    regions: [{ regionId: 0, korName: '전체', engName: 'ALL' }],
  }),
}));

jest.mock('../_hooks/useExploreFilters', () => ({
  useExploreFilters: () => ({
    regionIds: [],
    category: '',
    ratingPreset: undefined,
    toggleRegionId: jest.fn(),
    clearRegionIds: jest.fn(),
    toggleCategory: jest.fn(),
    clearCategory: jest.fn(),
    selectRatingPreset: jest.fn(),
    clearRating: jest.fn(),
    clearWhiskeyFilters: jest.fn(),
    clearReviewFilters: jest.fn(),
  }),
}));

const tabList = [{ id: 'EXPLORER_WHISKEY', name: '위스키 둘러보기' }];

function WhiskeySearch() {
  const { isSearchActive, onSearchActiveChange } = useTabbedListPageSearch();

  return (
    <ExploreSearchBar
      mode="realtime"
      description=""
      filterTarget="whiskey"
      isSearchActive={isSearchActive}
      onSearchActiveChange={onSearchActiveChange}
      initialValue=""
      onValueChange={jest.fn()}
      autoFocus
    />
  );
}

describe('위스키 검색 바로가기 진입', () => {
  it('검색창에 포커스한 검색 상태로 열려 바로 입력할 수 있다', async () => {
    render(
      <TabbedListPageHeader
        tabList={tabList}
        currentTab={tabList[0]}
        onTabChange={jest.fn()}
      >
        <WhiskeySearch />
      </TabbedListPageHeader>,
    );

    const input = screen.getByRole('textbox', { name: '위스키 검색' });
    await waitFor(() => expect(input).toHaveFocus());
    expect(screen.getByTestId('tabbed-list-page')).toHaveAttribute(
      'data-search-active',
      'true',
    );
    expect(mockSetNavbarSuppressed).toHaveBeenLastCalledWith(true);
  });
});
