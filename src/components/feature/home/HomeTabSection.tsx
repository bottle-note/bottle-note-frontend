'use client';

import Tab from '@/components/ui/Navigation/Tab';
import { useTab } from '@/hooks/useTab';

interface TabItem {
  id: string;
  name: string;
}

interface Props<T extends TabItem> {
  tabList: T[];
  scroll?: boolean;
  contentClassName?: string;
  /** 탭 위에 둘 섹션 머리. 고른 탭에 따라 바꿀 수 있다. */
  renderHeader?: (currentTab: T) => React.ReactNode;
  children: (currentTab: T) => React.ReactNode;
}

export default function HomeTabSection<T extends TabItem>({
  tabList,
  scroll = false,
  contentClassName,
  renderHeader,
  children,
}: Props<T>) {
  const {
    currentTab,
    handleTab,
    tabList: tabs,
    refs: { scrollContainerRef },
    registerTab,
  } = useTab({ tabList, scroll });

  return (
    <article className="space-y-16">
      {renderHeader?.(currentTab)}
      <Tab
        variant="bookmark"
        tabList={tabs}
        handleTab={handleTab}
        currentTab={currentTab}
        scrollContainerRef={scrollContainerRef}
        registerTab={registerTab}
      />
      <div className={contentClassName}>{children(currentTab)}</div>
    </article>
  );
}
