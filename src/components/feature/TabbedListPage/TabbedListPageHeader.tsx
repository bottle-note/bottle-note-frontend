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
  const { setNavbarSuppressed } = useNavLayout();
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
      <div data-testid="tabbed-list-page" data-search-active={isSearchActive}>
        {/* 로고가 스크롤되어 사라진 뒤에도 시스템 바 뒤로 목록이 비치지 않게 가린다 */}
        <div
          aria-hidden
          className="fixed-content top-0 z-20 h-[var(--safe-area-top)] bg-bg-layer-default"
        />
        <AutoHideLogoHeader isVisible={!isSearchActive} sticky={false} />
        <div
          data-testid="tabbed-list-bookmark"
          className="sticky top-[var(--safe-area-top)] z-10 bg-bg-layer-default"
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
        {typeof children === 'function'
          ? children(searchContextValue)
          : children}
      </div>
    </TabbedListPageSearchContext.Provider>
  );
}
