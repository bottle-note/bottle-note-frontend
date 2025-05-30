import { useEffect, useRef, useState } from 'react';

interface Props<T> {
  tabList: T[];
  scroll?: boolean;
  offset?: number;
  align?: 'center' | 'left';
}

export const useTab = <T extends { name: string; id: string }>({
  tabList,
  scroll = false,
  offset = 0,
  align = 'center',
}: Props<T>) => {
  const [currentTab, setCurrentTab] = useState(tabList[0]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<
    Record<string, HTMLDivElement | HTMLButtonElement | null>
  >({});

  const handleTab = (id: string) => {
    const selected = tabList.find((item) => item.id === id);

    setCurrentTab((prev) => selected ?? prev);
  };

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
