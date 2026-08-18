'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTab } from '@/hooks/useTab';
import Tab from '@/components/ui/Navigation/Tab';
import AutoHideLogoHeader from '@/components/ui/Navigation/AutoHideLogoHeader';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import useStatefulSearchParams from '@/hooks/useStatefulSearchParams';
import {
  parseExploreTabId,
  REVIEW_EXPLORE_TAB_ID,
  type ExploreTabId,
  WHISKEY_EXPLORE_TAB_ID,
} from './_constants/exploreTabs';
import { ReviewExplorerList } from './_components/ReviewExploreList';
import { WhiskeyExplorerList } from './_components/WhiskeyExploreList';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isNavigationVisible, setNavbarSuppressed } = useNavLayout();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [tabParam, setTabParam] = useStatefulSearchParams<ExploreTabId>('tab');
  const tabFromUrl = parseExploreTabId(tabParam);
  const isHeaderCollapsed = isSearchActive || !isNavigationVisible;

  const tabList = [
    { name: '리뷰 둘러보기', id: REVIEW_EXPLORE_TAB_ID },
    { name: '위스키 둘러보기', id: WHISKEY_EXPLORE_TAB_ID },
  ];

  const initialTab = tabList.find((tab) => tab.id === tabFromUrl) || tabList[0];

  const { currentTab, handleTab, refs, registerTab } = useTab({
    tabList,
    scroll: true,
    initialTab,
  });

  const hasSyncedInitialTabRef = useRef(false);
  const previousTabIdRef = useRef<ExploreTabId>(currentTab.id as ExploreTabId);

  const handleSearchActiveChange = useCallback(
    (active: boolean) => {
      setIsSearchActive(active);
      setNavbarSuppressed(active);
    },
    [setNavbarSuppressed],
  );

  useEffect(() => {
    const prevTabId = previousTabIdRef.current;
    const params = new URLSearchParams(searchParams.toString());

    if (!hasSyncedInitialTabRef.current) {
      hasSyncedInitialTabRef.current = true;
      previousTabIdRef.current = currentTab.id as ExploreTabId;

      if (params.get('tab') !== currentTab.id) {
        setTabParam(currentTab.id as ExploreTabId);
      }

      return;
    }

    if (prevTabId === currentTab.id) {
      return;
    }

    previousTabIdRef.current = currentTab.id as ExploreTabId;
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

  useEffect(() => {
    handleSearchActiveChange(false);
  }, [currentTab.id, handleSearchActiveChange]);

  useEffect(
    () => () => {
      setNavbarSuppressed(false);
    },
    [setNavbarSuppressed],
  );

  return (
    <Suspense>
      <div
        data-testid="explore-page"
        data-search-active={isSearchActive}
        data-header-collapsed={isHeaderCollapsed}
        className="min-h-safe-screen bg-bg-layer-default text-fg-neutral"
      >
        <div
          data-testid="explore-fixed-header"
          className="fixed-content top-0 z-10 bg-bg-layer-default"
        >
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
              handleTab={handleTab}
              currentTab={currentTab}
              scrollContainerRef={refs.scrollContainerRef}
              registerTab={registerTab}
            />
          </div>
        </div>
        <section
          data-testid="explore-content"
          className="h-full w-full px-4 pb-4 pt-0"
          style={{
            marginTop: 'var(--logo-header-expanded-height)',
          }}
        >
          {currentTab.id === WHISKEY_EXPLORE_TAB_ID && (
            <WhiskeyExplorerList
              isSearchActive={isSearchActive}
              onSearchActiveChange={handleSearchActiveChange}
            />
          )}
          {currentTab.id === REVIEW_EXPLORE_TAB_ID && (
            <ReviewExplorerList
              isSearchActive={isSearchActive}
              onSearchActiveChange={handleSearchActiveChange}
            />
          )}
        </section>
      </div>
    </Suspense>
  );
}
