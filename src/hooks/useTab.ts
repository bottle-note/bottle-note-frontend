import { useState } from 'react';

interface Props<T> {
  tabList: T[];
}

export const useTab = <T extends { name: string; id: string }>({
  tabList,
}: Props<T>) => {
  const [currentTab, setCurrentTab] = useState(tabList[0]);

  const handleTab = (id: string) => {
    const selected = tabList.find((item) => item.id === id);

    setCurrentTab((prev) => selected ?? prev);
  };

  return { currentTab, handleTab, tabList };
};
