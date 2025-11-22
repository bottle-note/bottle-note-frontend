'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTab } from '@/hooks/useTab';
import Tab from '@/components/ui/Navigation/Tab';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import useSearchParam from '@/hooks/useSearchParams';
import { ReviewExplorerList } from './_components/ReviewExploreList';
import { WhiskeyExplorerList } from './_components/WhiskeyExploreList';

type TabId = 'REVIEW_WHISKEY' | 'EXPLORER_WHISKEY';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tabParam, setTabParam] = useSearchParam<TabId>('tab');
  const tabFromUrl = (tabParam as TabId | null) || 'REVIEW_WHISKEY';

  const tabList = [
    { name: '리뷰 둘러보기', id: 'REVIEW_WHISKEY' },
    { name: '위스키 둘러보기', id: 'EXPLORER_WHISKEY' },
  ];

  const initialTab = tabList.find((tab) => tab.id === tabFromUrl) || tabList[0];

  const { currentTab, handleTab, refs, registerTab } = useTab({
    tabList,
    scroll: true,
    initialTab,
  });

  const hasSyncedInitialTabRef = useRef(false);
  const previousTabIdRef = useRef<TabId>(currentTab.id as TabId);

  useEffect(() => {
    const prevTabId = previousTabIdRef.current;
    const params = new URLSearchParams(searchParams.toString());

    if (!hasSyncedInitialTabRef.current) {
      hasSyncedInitialTabRef.current = true;
      previousTabIdRef.current = currentTab.id as TabId;

      if (params.get('tab') !== currentTab.id) {
        setTabParam(currentTab.id as TabId);
      }

      return;
    }

    if (prevTabId === currentTab.id) {
      return;
    }

    previousTabIdRef.current = currentTab.id as TabId;
    params.delete('keywords');
    params.set('tab', currentTab.id);

    router.replace(`/explore?${params.toString()}`, {
      scroll: false,
    });
  }, [currentTab.id, router, searchParams, setTabParam]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentTab.id]);

  return (
    <Suspense>
      <div className="fixed-content top-0 bg-white z-10 justify-center items-center">
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
      <section className="w-full h-full p-4 mt-[140px]">
        {currentTab.id === 'EXPLORER_WHISKEY' && <WhiskeyExplorerList />}
        {currentTab.id === 'REVIEW_WHISKEY' && <ReviewExplorerList />}
      </section>
    </Suspense>
  );
}
