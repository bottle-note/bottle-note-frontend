'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { CURATION_V2_SPEC_CODES } from '@/api/curation-v2/constants';
import { isWhiskyPairingFeedItem } from '@/api/curation-v2/guards';
import { ROUTES } from '@/constants/routes';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useTab } from '@/hooks/useTab';
import { useCurationsQuery } from '@/queries/useCurationsQuery';
import { useProgramsQuery } from '@/queries/useProgramsQuery';
import { useTastingEventsQuery } from '@/queries/useTastingEventsQuery';
import UnderlineSearchBar from '@/components/feature/Search/UnderlineSearchBar';
import Tab from '@/components/ui/Navigation/Tab';
import AutoHideLogoHeader from '@/components/ui/Navigation/AutoHideLogoHeader';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import { CurationFeedCard } from './_components/CurationFeedCard';
import { GuestCurationLoginPrompt } from './_components/GuestCurationLoginPrompt';
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

const GUEST_PREVIEW_ITEM_COUNT = 3;

const isCurationTabId = (value: string | null): value is CurationTabId => {
  return tabList.some((tab) => tab.id === value);
};

export default function CurationPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isNavigationVisible } = useNavLayout();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuthSession();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isGuestGateActive, setIsGuestGateActive] = useState(false);
  const guestGateRef = useRef<HTMLDivElement>(null);
  const tabParam = searchParams.get('tab');
  const tabFromUrl = isCurationTabId(tabParam) ? tabParam : DEFAULT_TAB_ID;
  const initialTab = tabList.find((tab) => tab.id === tabFromUrl) ?? tabList[0];
  const { currentTab, handleTab, refs, registerTab } = useTab({
    tabList,
    scroll: true,
    initialTab,
  });
  useEffect(() => {
    if (currentTab.id !== tabFromUrl) {
      handleTab(tabFromUrl);
    }
  }, [currentTab.id, handleTab, tabFromUrl]);

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

  const handleGuestLogin = () => {
    const returnTo = `${pathname}?${new URLSearchParams({
      tab: currentTab.id,
    }).toString()}`;

    router.push(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const trimmedSearchKeyword = searchKeyword.trim();
  const isTastingEventTab =
    currentTab.id === CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT;
  const isProgramTab = currentTab.id === CURATION_V2_SPEC_CODES.PROGRAM;
  const isRecommendedTab =
    currentTab.id === CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY;
  const curationsQuery = useCurationsQuery(
    10,
    trimmedSearchKeyword,
    isRecommendedTab,
  );
  const programsQuery = useProgramsQuery(
    10,
    trimmedSearchKeyword,
    CURATION_V2_SPEC_CODES.PROGRAM,
    isProgramTab,
  );
  const tastingEventsQuery = useTastingEventsQuery(
    10,
    trimmedSearchKeyword,
    CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT,
    isTastingEventTab,
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
    !isAuthLoading &&
    !isLoggedIn &&
    !activeQuery.isLoading &&
    !activeQuery.error &&
    Boolean(activeData && activeData.length > GUEST_PREVIEW_ITEM_COUNT);

  useEffect(() => {
    setIsGuestGateActive(false);

    if (!shouldGateGuestFeed || !guestGateRef.current) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        return;
      }

      setIsGuestGateActive(true);
      observer.disconnect();
    });

    observer.observe(guestGateRef.current);

    return () => observer.disconnect();
  }, [currentTab.id, shouldGateGuestFeed, trimmedSearchKeyword]);

  const renderFeedItems = (startIndex = 0, endIndex?: number) => {
    switch (currentTab.id) {
      case CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT:
        return tastingEventsQuery.data
          ?.slice(startIndex, endIndex)
          .map((event, index) => (
            <TastingEventFeedCard
              key={event.id}
              event={event}
              priority={startIndex + index === 0}
            />
          ));
      case CURATION_V2_SPEC_CODES.PROGRAM:
        return programsQuery.data
          ?.slice(startIndex, endIndex)
          .map((program, index) => (
            <ProgramFeedCard
              key={program.id}
              program={program}
              priority={startIndex + index === 0}
            />
          ));
      case CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY:
        return curationsQuery.data
          ?.slice(startIndex, endIndex)
          .map((curation, index) => (
            <CurationFeedCard
              key={curation.id}
              curation={curation}
              badgeLabel={
                isWhiskyPairingFeedItem(curation) ? '페어링' : '큐레이션'
              }
              priority={startIndex + index === 0}
            />
          ));
    }
  };

  return (
    <>
      <div className="fixed-content top-0 z-10 bg-bg-layer-default">
        <AutoHideLogoHeader sticky={false} />
        <div
          className="scroll-navigation-motion absolute inset-x-0 top-[var(--header-height-with-safe)] transition-transform"
          style={{
            transform: isNavigationVisible
              ? 'translateY(var(--logo-header-slide-distance))'
              : 'translateY(0)',
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
        <div className="px-5 pb-7 pt-7">
          <UnderlineSearchBar
            onSearch={setSearchKeyword}
            placeholder="키워드를 입력하세요"
            inputClassName="border-b border-stroke-brand-solid pb-2 pl-0 pr-20 pt-0 text-13 font-medium focus:border-stroke-brand-solid"
            actionsClassName="-top-1"
            renderActions={({ submit }) => (
              <button
                type="button"
                className="label-selected inline-flex h-7 items-center gap-1 text-13 font-medium leading-none"
                onClick={submit}
              >
                <Search size={14} aria-hidden className="shrink-0" />
                <span>검색</span>
              </button>
            )}
          />
        </div>

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
          !activeQuery.hasNextPage && (
            <p className="px-5 pb-navbar text-13 font-medium text-fg-neutral-muted">
              {emptyMessage}
            </p>
          )}

        {!activeQuery.isLoading &&
          !activeQuery.error &&
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
              {shouldGateGuestFeed ? (
                <>
                  {renderFeedItems(0, GUEST_PREVIEW_ITEM_COUNT)}
                  <div
                    ref={guestGateRef}
                    aria-hidden="true"
                    className="pointer-events-none h-24 select-none overflow-hidden"
                  >
                    {renderFeedItems(
                      GUEST_PREVIEW_ITEM_COUNT,
                      GUEST_PREVIEW_ITEM_COUNT + 1,
                    )}
                  </div>
                </>
              ) : (
                renderFeedItems()
              )}
              {activeQuery.hasNextPage && !shouldGateGuestFeed && (
                <div ref={activeQuery.targetRef} className="h-1" />
              )}
              {activeQuery.isFetchingNextPage && !shouldGateGuestFeed && (
                <p className="py-2 text-center text-12 font-medium text-fg-neutral-muted">
                  불러오는 중...
                </p>
              )}
            </div>
          )}
      </section>

      {isGuestGateActive && (
        <GuestCurationLoginPrompt onLogin={handleGuestLogin} />
      )}
    </>
  );
}
