'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { clearSearchParams } from '@/utils/clearSearchParams';

type TabItem = { id: string; name: string };

interface UseTabbedListNavigationOptions<T extends TabItem> {
  tabList: readonly T[];
  defaultTabId: T['id'];
  resetSearchParams?: readonly string[];
  omitDefaultTabParam?: boolean;
  writeDefaultTabParam?: boolean;
  navigation?: 'push' | 'replace';
  enabled?: boolean;
  onTabChange?: (tabId: T['id']) => void;
}

export function useTabbedListNavigation<T extends TabItem>({
  tabList,
  defaultTabId,
  resetSearchParams = [],
  omitDefaultTabParam = false,
  writeDefaultTabParam = false,
  navigation = 'replace',
  enabled = true,
  onTabChange,
}: UseTabbedListNavigationOptions<T>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const currentTab = useMemo(
    () =>
      tabList.find((tab) => tab.id === tabParam) ??
      tabList.find((tab) => tab.id === defaultTabId) ??
      tabList[0],
    [defaultTabId, tabList, tabParam],
  ) as T;

  const replaceUrl = useCallback(
    (params: URLSearchParams, method: 'push' | 'replace' = navigation) => {
      const query = params.toString();
      const href = query ? `${pathname}?${query}` : pathname;

      router[method](href, { scroll: false });
    },
    [navigation, pathname, router],
  );

  useEffect(() => {
    if (!enabled || !currentTab) return;

    const shouldWriteDefaultTab =
      writeDefaultTabParam && tabParam !== currentTab.id;
    const shouldRemoveDefaultTab =
      omitDefaultTabParam &&
      currentTab.id === defaultTabId &&
      tabParam !== null;
    const hasInvalidTab = tabParam !== null && tabParam !== currentTab.id;

    if (!shouldWriteDefaultTab && !shouldRemoveDefaultTab && !hasInvalidTab) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (omitDefaultTabParam && currentTab.id === defaultTabId) {
      params.delete('tab');
    } else {
      params.set('tab', currentTab.id);
    }

    replaceUrl(params, 'replace');
  }, [
    currentTab,
    defaultTabId,
    enabled,
    omitDefaultTabParam,
    replaceUrl,
    searchParams,
    tabParam,
    writeDefaultTabParam,
  ]);

  useEffect(() => {
    if (enabled && currentTab) {
      window.scrollTo(0, 0);
    }
  }, [currentTab?.id, enabled]);

  const handleTabChange = useCallback(
    (tabId: string) => {
      const nextTab = tabList.find((tab) => tab.id === tabId);

      if (!nextTab || nextTab.id === currentTab?.id) return;

      onTabChange?.(nextTab.id);

      const params = new URLSearchParams(searchParams.toString());
      clearSearchParams(params, resetSearchParams);

      if (omitDefaultTabParam && nextTab.id === defaultTabId) {
        params.delete('tab');
      } else {
        params.set('tab', nextTab.id);
      }

      replaceUrl(params);
    },
    [
      currentTab?.id,
      defaultTabId,
      omitDefaultTabParam,
      onTabChange,
      replaceUrl,
      resetSearchParams,
      searchParams,
      tabList,
    ],
  );

  return {
    currentTab,
    handleTabChange,
  };
}
