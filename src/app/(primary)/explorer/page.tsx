'use client';

import { Suspense } from 'react';
import { Header } from './_components/Header';
import { useTab } from '@/hooks/useTab';
import Tab from '@/components/Tab';
import ReviewCard from './_components/ReviewCard';
import { ReviewExplorerList } from './_components/ReviewExplorerList';
import { WhiskeyExplorerList } from './_components/WhiskeyExplorerList';

export default function ExplorerPage() {
  const { currentTab, handleTab, tabList, refs, registerTab } = useTab({
    tabList: [
      { name: '위스키 둘러보기', id: 'EXPLORER_WISKEY' },
      { name: '리뷰 둘러보기', id: 'REVIEW_WISKEY' },
    ],
    scroll: true,
  });

  return (
    <Suspense>
      <main className="mb-24 w-full min-h-screen relative bg-gray-50">
        <div className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
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
      </main>
    </Suspense>
  );
}
