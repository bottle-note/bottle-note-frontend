import { useCallback, useEffect, useRef, useState } from 'react';

interface Props<T> {
  tabList: T[];
  scroll?: boolean;
  offset?: number;
  align?: 'center' | 'left';
  initialTab?: T;
  activeTab?: T;
}

export const useTab = <T extends { name: string; id: string }>({
  tabList,
  scroll = false,
  offset = 0,
  align = 'center',
  initialTab,
  activeTab,
}: Props<T>) => {
  const [selectedTab, setSelectedTab] = useState(initialTab || tabList[0]);
  const currentTab = activeTab || selectedTab;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<
    Record<string, HTMLDivElement | HTMLButtonElement | null>
  >({});

  const handleTab = useCallback(
    (id: string) => {
      const selected = tabList.find((item) => item.id === id);

      if (!selected || selected.id === currentTab.id) return;

      setSelectedTab(selected);
    },
    [currentTab.id, tabList],
  );

  const registerTab =
    (id: string) => (el: HTMLDivElement | HTMLButtonElement | null) => {
      tabRefs.current[id] = el;
    };

  useEffect(() => {
    if (!scroll) return;
    const container = scrollContainerRef.current;
    const activeTab = tabRefs.current[currentTab.id];
    if (container && activeTab) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();

      let scrollTo = 0;

      if (align === 'center') {
        const containerCenter = containerRect.left + containerRect.width / 2;
        const tabCenter = tabRect.left + tabRect.width / 2;
        scrollTo =
          container.scrollLeft + (tabCenter - containerCenter) - offset;
      } else if (align === 'left') {
        scrollTo =
          container.scrollLeft + (tabRect.left - containerRect.left) - offset;
      }

      container.scrollTo({
        left: scrollTo,
        behavior: 'smooth',
      });
    }
  }, [currentTab.id, scroll, offset, align]);

  return {
    currentTab,
    handleTab,
    registerTab,
    tabList,
    refs: {
      scrollContainerRef,
      tabRefs,
    },
  };
};
