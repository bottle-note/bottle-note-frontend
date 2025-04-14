import { useState } from 'react';

export interface TabItem {
  id: string;
  name: string;
}

interface UseTabProps {
  initialTabId?: string;
  items: TabItem[];
}

interface UseTabReturn {
  activeTab: string;
  setActiveTab: (id: string) => void;
  items: TabItem[];
}

export const useTab = ({ initialTabId, items }: UseTabProps): UseTabReturn => {
  const [activeTab, setActiveTab] = useState(
    initialTabId || items[0]?.id || '',
  );

  return {
    activeTab,
    setActiveTab,
    items,
  };
};
