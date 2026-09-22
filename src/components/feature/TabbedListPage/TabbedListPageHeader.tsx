'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AutoHideLogoHeader from '@/components/ui/Navigation/AutoHideLogoHeader';
import Tab from '@/components/ui/Navigation/Tab';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import { useTab } from '@/hooks/useTab';

type TabItem = { id: string; name: string };

interface TabbedListPageSearchContextValue {
  isSearchActive: boolean;
  onSearchActiveChange: (active: boolean) => void;
}

const TabbedListPageSearchContext =
  createContext<TabbedListPageSearchContextValue | null>(null);

interface TabbedListPageHeaderProps<T extends TabItem> {
  tabList: readonly T[];
  currentTab: T;
  onTabChange: (id: string) => void;
  children:
    | React.ReactNode
    | ((search: TabbedListPageSearchContextValue) => React.ReactNode);
}

export function useTabbedListPageSearch() {
  const context = useContext(TabbedListPageSearchContext);

  if (!context) {
    throw new Error(
      'useTabbedListPageSearch must be used within TabbedListPageHeader.',
    );
  }

  return context;
}

export default function TabbedListPageHeader<T extends TabItem>({
  tabList,
  currentTab,
  onTabChange,
  children,
}: TabbedListPageHeaderProps<T>) {
  const { isNavigationVisible, setNavbarSuppressed } = useNavLayout();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const {
    currentTab: activeTab,
    refs,
    registerTab,
  } = useTab({
    tabList: [...tabList],
    activeTab: currentTab,
    scroll: true,
  });
  const isHeaderCollapsed = isSearchActive || !isNavigationVisible;

  const onSearchActiveChange = useCallback(
    (active: boolean) => {
      setIsSearchActive(active);
      setNavbarSuppressed(active);
    },
    [setNavbarSuppressed],
  );

  useEffect(() => {
    onSearchActiveChange(false);
  }, [activeTab.id, onSearchActiveChange]);

  useEffect(
    () => () => {
      setNavbarSuppressed(false);
    },
    [setNavbarSuppressed],
  );

  const searchContextValue = useMemo(
    () => ({ isSearchActive, onSearchActiveChange }),
    [isSearchActive, onSearchActiveChange],
  );

  return (
    <TabbedListPageSearchContext.Provider value={searchContextValue}>
      <div
        data-testid="tabbed-list-page"
        data-search-active={isSearchActive}
        data-header-collapsed={isHeaderCollapsed}
      >
        <div className="fixed-content top-0 z-10 bg-bg-layer-default">
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
              tabList={[...tabList]}
              handleTab={onTabChange}
              currentTab={activeTab}
              scrollContainerRef={refs.scrollContainerRef}
              registerTab={registerTab}
            />
          </div>
        </div>
        {typeof children === 'function'
          ? children(searchContextValue)
          : children}
      </div>
    </TabbedListPageSearchContext.Provider>
  );
}
