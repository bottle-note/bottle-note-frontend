'use client';

import { Suspense } from 'react';
import TabbedListPageHeader, {
  useTabbedListPageSearch,
} from '@/components/feature/TabbedListPage/TabbedListPageHeader';
import { useTabbedListNavigation } from '@/hooks/useTabbedListNavigation';
import {
  REVIEW_EXPLORE_TAB_ID,
  type ExploreTabId,
  WHISKEY_EXPLORE_TAB_ID,
} from './_constants/exploreTabs';
import { ReviewExplorerList } from './_components/ReviewExploreList';
import { WhiskeyExplorerList } from './_components/WhiskeyExploreList';

export default function ExplorePage() {
  const tabList = [
    { name: '리뷰 둘러보기', id: REVIEW_EXPLORE_TAB_ID },
    { name: '위스키 둘러보기', id: WHISKEY_EXPLORE_TAB_ID },
  ];
  const { currentTab, handleTabChange } = useTabbedListNavigation({
    tabList,
    defaultTabId: REVIEW_EXPLORE_TAB_ID,
    resetSearchParams: [
      'keyword',
      'keywords',
      'sortType',
      'sortOrder',
      'rating',
      'category',
      'regionIds',
    ],
    writeDefaultTabParam: true,
  });

  return (
    <Suspense>
      <TabbedListPageHeader
        tabList={tabList}
        currentTab={currentTab}
        onTabChange={handleTabChange}
      >
        <ExploreContent currentTabId={currentTab.id as ExploreTabId} />
      </TabbedListPageHeader>
    </Suspense>
  );
}

function ExploreContent({ currentTabId }: { currentTabId: ExploreTabId }) {
  const { isSearchActive, onSearchActiveChange } = useTabbedListPageSearch();

  return (
    <div
      data-testid="explore-page"
      className="min-h-safe-screen bg-bg-layer-default text-fg-neutral"
    >
      <section
        data-testid="explore-content"
        className="h-full w-full px-20 pb-16 pt-0"
        style={{ marginTop: 'var(--logo-header-expanded-height)' }}
      >
        {currentTabId === WHISKEY_EXPLORE_TAB_ID && (
          <WhiskeyExplorerList
            isSearchActive={isSearchActive}
            onSearchActiveChange={onSearchActiveChange}
          />
        )}
        {currentTabId === REVIEW_EXPLORE_TAB_ID && (
          <ReviewExplorerList
            isSearchActive={isSearchActive}
            onSearchActiveChange={onSearchActiveChange}
          />
        )}
      </section>
    </div>
  );
}
