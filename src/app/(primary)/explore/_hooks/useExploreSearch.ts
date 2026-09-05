import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  parseExploreTabId,
  type ExploreTabId,
} from '../_constants/exploreTabs';

const DEBOUNCE_DELAY_MS = 300;

interface UseExploreSearchOptions {
  tabId: ExploreTabId;
}

export const normalizeExploreKeyword = (keyword: string) =>
  keyword.trim().replace(/\s+/g, ' ');

export const useExploreSearch = ({ tabId }: UseExploreSearchOptions) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sourceTabId = parseExploreTabId(searchParams.get('tab'));
  const initialKeyword =
    sourceTabId === tabId ? searchParams.get('keyword') ?? '' : '';

  const [inputKeyword, setInputKeyword] = useState(initialKeyword);
  const normalizedKeyword = useMemo(
    () => normalizeExploreKeyword(inputKeyword),
    [inputKeyword],
  );
  const [debouncedKeyword, setDebouncedKeyword] = useState(() =>
    normalizeExploreKeyword(initialKeyword),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(normalizedKeyword);
    }, DEBOUNCE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [normalizedKeyword]);

  useEffect(() => {
    if (parseExploreTabId(searchParams.get('tab')) !== tabId) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    params.delete('keyword');
    params.delete('keywords');

    if (debouncedKeyword) {
      params.set('keyword', debouncedKeyword);
    }

    const nextQuery = params.toString();
    if (nextQuery === searchParams.toString()) return;

    router.replace(`${pathname}?${nextQuery}`, { scroll: false });
  }, [debouncedKeyword, pathname, router, searchParams, tabId]);

  return {
    inputKeyword,
    debouncedKeyword,
    isTyping: normalizedKeyword !== debouncedKeyword,
    setInputKeyword,
  };
};
