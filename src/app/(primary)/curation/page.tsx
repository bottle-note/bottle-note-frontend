'use client';

import { Search } from 'lucide-react';
import { useTab } from '@/hooks/useTab';
import { useCurationsQuery } from '@/queries/useCurationsQuery';
import { useTastingEventsQuery } from '@/queries/useTastingEventsQuery';
import UnderlineSearchBar from '@/components/feature/Search/UnderlineSearchBar';
import Tab from '@/components/ui/Navigation/Tab';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import { CurationCard } from './_components/CurationCard';

type CurationTabId = 'CURATION' | 'TASTING_EVENT';

const tabList = [
  // { name: '큐레이션', id: 'CURATION' },
  { name: '시음회', id: 'TASTING_EVENT' },
] satisfies { name: string; id: CurationTabId }[];

export default function CurationPage() {
  const { currentTab, handleTab, refs, registerTab } = useTab({
    tabList,
    scroll: true,
    initialTab: tabList[0],
  });
  const curationsQuery = useCurationsQuery();
  const tastingEventsQuery = useTastingEventsQuery();
  const isTastingEventTab = currentTab.id === 'TASTING_EVENT';
  const data = isTastingEventTab
    ? tastingEventsQuery.data
    : curationsQuery.data;
  const isLoading = isTastingEventTab
    ? tastingEventsQuery.isLoading
    : curationsQuery.isLoading;
  const isError = isTastingEventTab
    ? tastingEventsQuery.isError
    : curationsQuery.isError;
  const emptyMessage = isTastingEventTab
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
          handleTab={handleTab}
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
            placeholder="키워드를 입력하세요"
            inputClassName="border-b border-subCoral pl-0 pr-20 pb-2 pt-0 text-13 font-medium placeholder-brightGray focus:border-subCoral"
            actionsClassName="-top-1"
            renderActions={({ submit }) => (
              <button
                type="button"
                className="label-selected inline-flex items-center gap-0.5 px-2.5 py-1 text-13 font-medium leading-none"
                onClick={submit}
              >
                <span>검색</span>
                <Search size={12} aria-hidden />
              </button>
            )}
          />
        </div>

        {isLoading && (
          <div className="space-y-7 px-5 pb-navbar">
            <div className="h-[390px] animate-pulse rounded-lg bg-sectionWhite" />
            <div className="h-[390px] animate-pulse rounded-lg bg-sectionWhite" />
          </div>
        )}

        {isError && (
          <p className="px-5 pb-navbar text-13 font-medium text-mainGray">
            {errorMessage}
          </p>
        )}

        {!isLoading && !isError && (!data || data.length === 0) && (
          <p className="px-5 pb-navbar text-13 font-medium text-mainGray">
            {emptyMessage}
          </p>
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <div className="space-y-7 px-5 pb-navbar">
            {data.map((curation, index) => (
              <CurationCard
                key={curation.id}
                curation={curation}
                priority={index === 0}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
