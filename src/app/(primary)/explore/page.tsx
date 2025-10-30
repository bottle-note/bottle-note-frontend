'use client';

import { Suspense, useEffect } from 'react';
import { useTab } from '@/hooks/useTab';
import Tab from '@/components/ui/Navigation/Tab';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import { ReviewExplorerList } from './_components/ReviewExploreList';
import { WhiskeyExplorerList } from './_components/WhiskeyExploreList';

export default function ExplorePage() {
  const { currentTab, handleTab, tabList, refs, registerTab } = useTab({
    tabList: [
      { name: '위스키 둘러보기', id: 'EXPLORER_WHISKEY' },
      { name: '리뷰 둘러보기', id: 'REVIEW_WHISKEY' },
    ],
    scroll: true,
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentTab.id]);

  return (
    <Suspense>
      <div className="fixed top-0 left-0 right-0 bg-white z-10">
        <SubHeader>
          <SubHeader.Left showLogo />
          <SubHeader.Right showSideMenu />
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
      <section className="w-full h-full mt-[100px] p-4 md:p-6 pt-14">
        {currentTab.id === 'EXPLORER_WHISKEY' && <WhiskeyExplorerList />}
        {currentTab.id === 'REVIEW_WHISKEY' && <ReviewExplorerList />}
      </section>
    </Suspense>
  );
}
