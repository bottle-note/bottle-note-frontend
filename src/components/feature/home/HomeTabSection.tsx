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
  children: (currentTab: T) => React.ReactNode;
}

export default function HomeTabSection<T extends TabItem>({
  tabList,
  scroll = false,
  contentClassName,
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
    <article className="space-y-[30px]">
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
