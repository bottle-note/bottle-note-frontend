'use client';

import { Suspense } from 'react';
import { Header } from './_components/Header';
import { useTab } from '@/hooks/useTab';
import Tab from '@/components/Tab';

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
      <main className="mb-24 w-full h-full relative">
        <div className="fixed top-0 left-0 right-0 bg-white z-50">
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
      </main>
    </Suspense>
  );
}
