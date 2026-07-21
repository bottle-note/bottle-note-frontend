'use client';

import type { CSSProperties } from 'react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTab } from '@/hooks/useTab';
import Tab from '@/components/ui/Navigation/Tab';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import useStatefulSearchParams from '@/hooks/useStatefulSearchParams';
import { cn } from '@/lib/utils';
import { ReviewExplorerList } from './_components/ReviewExploreList';
import { WhiskeyExplorerList } from './_components/WhiskeyExploreList';

type TabId = 'REVIEW_WHISKEY' | 'EXPLORER_WHISKEY';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isScrollVisible, setNavbarSuppressed } = useNavLayout();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [tabParam, setTabParam] = useStatefulSearchParams<TabId>('tab');
  const tabFromUrl = (tabParam as TabId | null) || 'REVIEW_WHISKEY';
  const isHeaderCollapsed = isSearchActive || !isScrollVisible;

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

  useEffect(() => {
    if (currentTab.id !== 'EXPLORER_WHISKEY') {
      handleSearchActiveChange(false);
    }
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
        style={
          {
            '--explore-current-header-height': isHeaderCollapsed
              ? 'var(--explore-collapsed-header-height)'
              : 'var(--explore-fixed-header-height)',
          } as CSSProperties
        }
      >
        <div
          data-testid="explore-fixed-header"
          className="fixed-content top-0 z-10 overflow-hidden bg-white transition-[min-height] duration-150 ease-out motion-reduce:transition-none"
          style={{ minHeight: 'var(--explore-current-header-height)' }}
        >
          <div
            aria-hidden={isHeaderCollapsed}
            className={cn(
              'overflow-hidden transition-[height,opacity] duration-150 ease-out motion-reduce:transition-none',
              isHeaderCollapsed
                ? 'pointer-events-none opacity-0'
                : 'opacity-100',
            )}
            style={{
              height: 'calc(var(--explore-current-header-height) - 32px)',
            }}
          >
            {!isHeaderCollapsed && (
              <SubHeader>
                <SubHeader.Left>
                  <SubHeader.Logo />
                </SubHeader.Left>
                <SubHeader.Right>
                  <SubHeader.Menu />
                </SubHeader.Right>
              </SubHeader>
            )}
          </div>
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
          data-testid="explore-content"
          className="h-full w-full px-4 pb-4 pt-0 transition-[margin-top] duration-150 ease-out motion-reduce:transition-none"
          style={{
            marginTop: 'var(--explore-current-header-height)',
          }}
        >
          {currentTab.id === 'EXPLORER_WHISKEY' && (
            <WhiskeyExplorerList
              isSearchActive={isSearchActive}
              onSearchActiveChange={handleSearchActiveChange}
            />
          )}
          {currentTab.id === 'REVIEW_WHISKEY' && <ReviewExplorerList />}
        </section>
      </div>
    </Suspense>
  );
}
