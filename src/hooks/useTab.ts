import { useState } from 'react';

interface Props {
  tabList: { name: string; id: string }[];
}

export const useTab = ({ tabList }: Props) => {
  const [currentTab, setCurrentTab] = useState(tabList[0]);

  const handleTab = (id: string) => {
    const selected = tabList.find((item) => item.id === id);

    setCurrentTab((prev) => selected ?? prev);
  };

  return { currentTab, handleTab, tabList };
};
