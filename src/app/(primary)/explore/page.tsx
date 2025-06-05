'use client';

import { Suspense } from 'react';
import { useTab } from '@/hooks/useTab';
import Tab from '@/components/Tab';
import { Header } from './_components/Header';
import { ReviewExplorerList } from './_components/ReviewExploreList';
import { WhiskeyExplorerList } from './_components/WhiskeyExploreList';

export default function ExplorePage() {
  const { currentTab, handleTab, tabList, refs, registerTab } = useTab({
    tabList: [
      { name: '위스키 둘러보기', id: 'EXPLORER_WISKEY' },
      { name: '리뷰 둘러보기', id: 'REVIEW_WISKEY' },
    ],
    scroll: true,
  });

  return (
    <Suspense>
      <div className="fixed top-0 left-0 right-0 bg-white z-10 shadow-sm">
        <Header />
        <Tab
          variant="bookmark"
          tabList={tabList}
          handleTab={handleTab}
          currentTab={currentTab}
          scrollContainerRef={refs.scrollContainerRef}
          registerTab={registerTab}
        />
      </div>
      <section className="w-full h-full mt-[100px] p-4 md:p-6">
        {currentTab.id === 'EXPLORER_WISKEY' && <WhiskeyExplorerList />}

        {currentTab.id === 'REVIEW_WISKEY' && <ReviewExplorerList />}
      </section>
    </Suspense>
  );
}
