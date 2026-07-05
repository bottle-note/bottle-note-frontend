'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { CURATION_V2_SPEC_CODES } from '@/api/curation-v2/constants';
import { useTab } from '@/hooks/useTab';
import { useCurationsQuery } from '@/queries/useCurationsQuery';
import { useTastingEventsQuery } from '@/queries/useTastingEventsQuery';
import UnderlineSearchBar from '@/components/feature/Search/UnderlineSearchBar';
import Tab from '@/components/ui/Navigation/Tab';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import { RecommendedCurationFeedCard } from './_components/RecommendedCurationFeedCard';
import { TastingEventFeedCard } from './_components/TastingEventFeedCard';

type CurationTabId =
  | typeof CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT
  | typeof CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY;

const tabList = [
  { name: '시음회', id: CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT },
  { name: '큐레이션', id: CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY },
] satisfies { name: string; id: CurationTabId }[];

const DEFAULT_TAB_ID =
  CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT satisfies CurationTabId;

const isCurationTabId = (value: string | null): value is CurationTabId => {
  return tabList.some((tab) => tab.id === value);
};

export default function CurationPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchKeyword, setSearchKeyword] = useState('');
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
    if (!isCurationTabId(id)) {
      return;
    }

    if (searchParams.get('tab') === id) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', id);

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const trimmedSearchKeyword = searchKeyword.trim();
  const isTastingEventTab =
    currentTab.id === CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT;
  const curationsQuery = useCurationsQuery(
    10,
    trimmedSearchKeyword,
    CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY,
    !isTastingEventTab,
  );
  const tastingEventsQuery = useTastingEventsQuery(
    10,
    trimmedSearchKeyword,
    CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT,
    isTastingEventTab,
  );
  const data = isTastingEventTab
    ? tastingEventsQuery.data
    : curationsQuery.data;
  const isLoading = isTastingEventTab
    ? tastingEventsQuery.isLoading
    : curationsQuery.isLoading;
  const isError = isTastingEventTab
    ? Boolean(tastingEventsQuery.error)
    : Boolean(curationsQuery.error);
  const isFetchingNextPage = isTastingEventTab
    ? tastingEventsQuery.isFetchingNextPage
    : curationsQuery.isFetchingNextPage;
  const hasNextPage = isTastingEventTab
    ? tastingEventsQuery.hasNextPage
    : curationsQuery.hasNextPage;
  const targetRef = isTastingEventTab
    ? tastingEventsQuery.targetRef
    : curationsQuery.targetRef;
  const emptyMessage =
    trimmedSearchKeyword.length > 0
      ? '검색 결과가 없어요.'
      : isTastingEventTab
        ? '진행 중인 시음회가 없어요.'
        : '등록된 큐레이션이 없어요.';
  const errorMessage = isTastingEventTab
    ? '시음회 정보를 불러오지 못했어요.'
    : '큐레이션 정보를 불러오지 못했어요.';

  return (
    <>
      <div className="fixed-content top-0 z-10 items-center justify-center bg-white">
        <SubHeader>
          <SubHeader.Left>
            <SubHeader.Logo />
          </SubHeader.Left>
          <SubHeader.Right>
            <SubHeader.Menu />
          </SubHeader.Right>
        </SubHeader>
        <Tab
          variant="bookmark"
          tabList={tabList}
          handleTab={handleCurationTab}
          currentTab={currentTab}
          scrollContainerRef={refs.scrollContainerRef}
          registerTab={registerTab}
        />
      </div>

      <section
        className="w-full bg-white"
        style={{
          marginTop: 'calc(var(--header-height-with-safe) + var(--tab-height))',
        }}
      >
        <div className="px-5 pb-7 pt-7">
          <UnderlineSearchBar
            onSearch={setSearchKeyword}
            placeholder="키워드를 입력하세요"
            inputClassName="border-b border-subCoral pl-0 pr-20 pb-2 pt-0 text-13 font-medium placeholder-brightGray focus:border-subCoral"
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

        {isLoading && (
          <div className="space-y-7 px-5 pb-navbar">
            <div
              className={`animate-pulse rounded-lg bg-sectionWhite ${
                isTastingEventTab ? 'h-[390px]' : 'h-[157px]'
              }`}
            />
            <div
              className={`animate-pulse rounded-lg bg-sectionWhite ${
                isTastingEventTab ? 'h-[390px]' : 'h-[157px]'
              }`}
            />
          </div>
        )}

        {isError && (
          <p className="px-5 pb-navbar text-13 font-medium text-mainGray">
            {errorMessage}
          </p>
        )}

        {!isLoading &&
          !isError &&
          (!data || data.length === 0) &&
          !hasNextPage && (
            <p className="px-5 pb-navbar text-13 font-medium text-mainGray">
              {emptyMessage}
            </p>
          )}

        {!isLoading && !isError && data && data.length === 0 && hasNextPage && (
          <div className="px-5 pb-navbar">
            <div ref={targetRef} className="h-1" />
            <p className="py-2 text-center text-12 font-medium text-mainGray">
              불러오는 중...
            </p>
          </div>
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <div className="space-y-7 px-5 pb-navbar">
            {isTastingEventTab
              ? tastingEventsQuery.data?.map((event, index) => (
                  <TastingEventFeedCard
                    key={event.id}
                    event={event}
                    priority={index === 0}
                  />
                ))
              : curationsQuery.data?.map((curation, index) => (
                  <RecommendedCurationFeedCard
                    key={curation.id}
                    curation={curation}
                    priority={index === 0}
                  />
                ))}
            {hasNextPage && <div ref={targetRef} className="h-1" />}
            {isFetchingNextPage && (
              <p className="py-2 text-center text-12 font-medium text-mainGray">
                불러오는 중...
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
