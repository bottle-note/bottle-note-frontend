'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ListFilter } from 'lucide-react';
import {
  CURATION_V2_SORT_TYPES,
  CURATION_V2_SPEC_CODES,
  type CurationV2SortType,
} from '@/api/curation-v2/constants';
import type { CurationV2FeedItem } from '@/api/curation-v2/types';
import { SORT_ORDER } from '@/api/_shared/types';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useTab } from '@/hooks/useTab';
import { useCurationsQuery } from '@/queries/useCurationsQuery';
import { useProgramsQuery } from '@/queries/useProgramsQuery';
import { useTastingEventsQuery } from '@/queries/useTastingEventsQuery';
import {
  GUEST_LIST_PAGE_SIZE,
  GuestListGate,
} from '@/components/feature/auth/GuestListGate';
import StickySearchBar from '@/components/feature/Search/StickySearchBar';
import SideFilterDrawer from '@/components/feature/SideFilterDrawer';
import { Accordion } from '@/components/feature/SideFilterDrawer/Accordion';
import Tab from '@/components/ui/Navigation/Tab';
import AutoHideLogoHeader from '@/components/ui/Navigation/AutoHideLogoHeader';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import { CurationFeedCard } from './_components/CurationFeedCard';
import { ProgramFeedCard } from './_components/ProgramFeedCard';
import { TastingEventFeedCard } from './_components/TastingEventFeedCard';

type CurationTabId =
  | typeof CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT
  | typeof CURATION_V2_SPEC_CODES.PROGRAM
  | typeof CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY;

// Product가 전용 렌더러를 제공하는 스펙만 고정 노출합니다. 데이터가 없는
// 스펙도 탭과 빈 상태를 유지하며, 새 스펙은 렌더러와 함께 명시적으로 추가합니다.
const tabList = [
  { name: '시음회', id: CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT },
  { name: '프로그램', id: CURATION_V2_SPEC_CODES.PROGRAM },
  { name: '큐레이션', id: CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY },
] satisfies { name: string; id: CurationTabId }[];

const DEFAULT_TAB_ID =
  CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT satisfies CurationTabId;

const SEARCH_DEBOUNCE_DELAY_MS = 300;

const CURATION_SORT_OPTIONS = [
  { name: '최신순', type: CURATION_V2_SORT_TYPES.EXPOSURE_START_DATE },
  { name: '추천순', type: CURATION_V2_SORT_TYPES.DISPLAY_ORDER },
] satisfies { name: string; type: CurationV2SortType }[];

const SORT_ORDER_BY_TYPE: Record<CurationV2SortType, SORT_ORDER> = {
  [CURATION_V2_SORT_TYPES.EXPOSURE_START_DATE]: SORT_ORDER.DESC,
  [CURATION_V2_SORT_TYPES.DISPLAY_ORDER]: SORT_ORDER.ASC,
};

const isCurationTabId = (value: string | null): value is CurationTabId => {
  return tabList.some((tab) => tab.id === value);
};

const hasPairingPayload = (item: CurationV2FeedItem) =>
  Array.isArray(item.payload) &&
  item.payload.some(
    (payloadItem) =>
      typeof payloadItem === 'object' &&
      payloadItem !== null &&
      'pairings' in payloadItem,
  );

export default function CurationPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isNavigationVisible, setNavbarSuppressed } = useNavLayout();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuthSession();
  const [inputKeyword, setInputKeyword] = useState('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [sortType, setSortType] = useState<CurationV2SortType>(
    CURATION_V2_SORT_TYPES.EXPOSURE_START_DATE,
  );
  const [isOpenSideFilter, setIsOpenSideFilter] = useState(false);
  const tabParam = searchParams.get('tab');
  const tabFromUrl = isCurationTabId(tabParam) ? tabParam : DEFAULT_TAB_ID;
  const initialTab = tabList.find((tab) => tab.id === tabFromUrl) ?? tabList[0];
  const { currentTab, handleTab, refs, registerTab } = useTab({
    tabList,
    scroll: true,
    initialTab,
  });
  const isHeaderCollapsed = isSearchActive || !isNavigationVisible;
  const handleSearchActiveChange = useCallback(
    (active: boolean) => {
      setIsSearchActive(active);
      setNavbarSuppressed(active);
    },
    [setNavbarSuppressed],
  );

  useEffect(() => {
    if (currentTab.id !== tabFromUrl) {
      handleTab(tabFromUrl);
    }
  }, [currentTab.id, handleTab, tabFromUrl]);

  useEffect(() => {
    handleSearchActiveChange(false);
  }, [currentTab.id, handleSearchActiveChange]);

  useEffect(
    () => () => {
      setNavbarSuppressed(false);
    },
    [setNavbarSuppressed],
  );

  const normalizedSearchKeyword = inputKeyword.trim().replace(/\s+/g, ' ');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchKeyword(normalizedSearchKeyword);
    }, SEARCH_DEBOUNCE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [normalizedSearchKeyword]);

  useEffect(() => {
    if (tabParam === tabFromUrl) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabFromUrl);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, tabFromUrl, tabParam]);

  const handleCurationTab = (id: string) => {
    if (!isCurationTabId(id) || searchParams.get('tab') === id) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', id);

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSortType = (value: string) => {
    if (
      value === CURATION_V2_SORT_TYPES.EXPOSURE_START_DATE ||
      value === CURATION_V2_SORT_TYPES.DISPLAY_ORDER
    ) {
      setSortType(value);
    }
  };

  const resetFilter = () => {
    setSortType(CURATION_V2_SORT_TYPES.EXPOSURE_START_DATE);
  };

  const trimmedSearchKeyword = debouncedSearchKeyword;
  const isTastingEventTab =
    currentTab.id === CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT;
  const isProgramTab = currentTab.id === CURATION_V2_SPEC_CODES.PROGRAM;
  const isRecommendedTab =
    currentTab.id === CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY;
  const isGuest = !isAuthLoading && !isLoggedIn;
  const pageSize = isGuest ? GUEST_LIST_PAGE_SIZE : 10;
  const sortOrder = SORT_ORDER_BY_TYPE[sortType];
  const curationsQuery = useCurationsQuery(
    pageSize,
    trimmedSearchKeyword,
    isRecommendedTab,
    sortType,
    sortOrder,
  );
  const programsQuery = useProgramsQuery(
    pageSize,
    trimmedSearchKeyword,
    CURATION_V2_SPEC_CODES.PROGRAM,
    isProgramTab,
    sortType,
    sortOrder,
  );
  const tastingEventsQuery = useTastingEventsQuery(
    pageSize,
    trimmedSearchKeyword,
    CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT,
    isTastingEventTab,
    sortType,
    sortOrder,
  );

  const activeTabState = (() => {
    switch (currentTab.id) {
      case CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT:
        return {
          query: tastingEventsQuery,
          data: tastingEventsQuery.data,
          emptyMessage: '진행 중인 시음회가 없어요.',
          errorMessage: '시음회 정보를 불러오지 못했어요.',
          skeletonHeight: 'h-[390px]',
        };
      case CURATION_V2_SPEC_CODES.PROGRAM:
        return {
          query: programsQuery,
          data: programsQuery.data,
          emptyMessage: '등록된 프로그램이 없어요.',
          errorMessage: '프로그램 정보를 불러오지 못했어요.',
          skeletonHeight: 'h-[248px]',
        };
      case CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY:
        return {
          query: curationsQuery,
          data: curationsQuery.data,
          emptyMessage: '등록된 큐레이션이 없어요.',
          errorMessage: '큐레이션 정보를 불러오지 못했어요.',
          skeletonHeight: 'h-[157px]',
        };
    }
  })();
  const {
    query: activeQuery,
    data: activeData,
    errorMessage,
    skeletonHeight,
  } = activeTabState;
  const emptyMessage = trimmedSearchKeyword
    ? '검색 결과가 없어요.'
    : activeTabState.emptyMessage;
  const shouldGateGuestFeed =
    isGuest &&
    !activeQuery.isLoading &&
    !activeQuery.error &&
    Boolean(activeData && activeData.length > 0);

  const renderFeedItems = () => {
    switch (currentTab.id) {
      case CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT:
        return tastingEventsQuery.data?.map((event, index) => (
          <TastingEventFeedCard
            key={event.id}
            event={event}
            priority={index === 0}
          />
        ));
      case CURATION_V2_SPEC_CODES.PROGRAM:
        return programsQuery.data?.map((program, index) => (
          <ProgramFeedCard
            key={program.id}
            program={program}
            priority={index === 0}
          />
        ));
      case CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY:
        return curationsQuery.data?.map((curation, index) => (
          <CurationFeedCard
            key={curation.id}
            curation={curation}
            badgeLabel={hasPairingPayload(curation) ? '페어링' : '큐레이션'}
            priority={index === 0}
          />
        ));
    }
  };

  return (
    <>
      <div className="fixed-content top-0 z-10 bg-bg-layer-default">
        <AutoHideLogoHeader isVisible={!isHeaderCollapsed} sticky={false} />
        <div
          className="scroll-navigation-motion absolute inset-x-0 top-[var(--header-height-with-safe)] transition-transform"
          style={{
            transform: isHeaderCollapsed
              ? 'translateY(0)'
              : 'translateY(var(--logo-header-slide-distance))',
          }}
        >
          <Tab
            variant="bookmark"
            tabList={tabList}
            handleTab={handleCurationTab}
            currentTab={currentTab}
            scrollContainerRef={refs.scrollContainerRef}
            registerTab={registerTab}
          />
        </div>
      </div>

      <section
        className="w-full bg-bg-layer-default text-fg-neutral"
        style={{
          marginTop: 'var(--logo-header-expanded-height)',
        }}
      >
        <StickySearchBar
          testId="curation-search-bar"
          containerClassName="px-4 pb-7 pt-[5px]"
          isSearchActive={isSearchActive}
          onSearchActiveChange={handleSearchActiveChange}
          onValueChange={setInputKeyword}
          placeholder="키워드를 입력하세요"
          ariaLabel="큐레이션 검색"
          clearable
          inputClassName="pr-16"
          renderActions={() => (
            <button
              type="button"
              aria-label="필터메뉴"
              className="rounded-sm text-fg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
              onClick={() => setIsOpenSideFilter(true)}
            >
              <ListFilter aria-hidden className="h-5 w-5" />
            </button>
          )}
        />

        <SideFilterDrawer
          isOpen={isOpenSideFilter}
          onClose={() => setIsOpenSideFilter(false)}
          resetFilter={resetFilter}
        >
          <Accordion title="정렬">
            <Accordion.Grid cols={2}>
              {CURATION_SORT_OPTIONS.map((option) => (
                <Accordion.Content
                  key={option.type}
                  title={option.name}
                  value={option.type}
                  isSelected={sortType === option.type}
                  onClick={handleSortType}
                />
              ))}
            </Accordion.Grid>
          </Accordion>
        </SideFilterDrawer>

        {activeQuery.isLoading && (
          <div className="space-y-7 px-5 pb-navbar">
            <div
              className={`animate-pulse rounded-lg bg-bg-neutral-weak ${skeletonHeight}`}
            />
            <div
              className={`animate-pulse rounded-lg bg-bg-neutral-weak ${skeletonHeight}`}
            />
          </div>
        )}

        {activeQuery.error && (
          <p className="px-5 pb-navbar text-13 font-medium text-fg-neutral-muted">
            {errorMessage}
          </p>
        )}

        {!activeQuery.isLoading &&
          !activeQuery.error &&
          (!activeData || activeData.length === 0) &&
          !isAuthLoading &&
          (isGuest || !activeQuery.hasNextPage) && (
            <p className="px-5 pb-navbar text-13 font-medium text-fg-neutral-muted">
              {emptyMessage}
            </p>
          )}

        {!activeQuery.isLoading &&
          !activeQuery.error &&
          isLoggedIn &&
          activeData &&
          activeData.length === 0 &&
          activeQuery.hasNextPage && (
            <div className="px-5 pb-navbar">
              <div ref={activeQuery.targetRef} className="h-1" />
              <p className="py-2 text-center text-12 font-medium text-fg-neutral-muted">
                불러오는 중...
              </p>
            </div>
          )}

        {!activeQuery.isLoading &&
          !activeQuery.error &&
          activeData &&
          activeData.length > 0 && (
            <div
              className={`space-y-7 px-5 ${shouldGateGuestFeed ? 'pb-0' : 'pb-navbar'}`}
            >
              {activeData && activeData.length > 0 && renderFeedItems()}
              {shouldGateGuestFeed && (
                <GuestListGate
                  key={`${currentTab.id}-${trimmedSearchKeyword}-${sortType}`}
                  title="더 많은 이야기가 궁금하신가요?"
                  description="로그인하고 보틀노트의 시음회와 큐레이션을 만나보세요."
                />
              )}
              {activeQuery.hasNextPage && isLoggedIn && (
                <div ref={activeQuery.targetRef} className="h-1" />
              )}
              {activeQuery.isFetchingNextPage && isLoggedIn && (
                <p className="py-2 text-center text-12 font-medium text-fg-neutral-muted">
                  불러오는 중...
                </p>
              )}
            </div>
          )}
      </section>
    </>
  );
}
