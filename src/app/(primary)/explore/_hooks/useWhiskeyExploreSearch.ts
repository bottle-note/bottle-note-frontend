import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  parseExploreTabId,
  WHISKEY_EXPLORE_TAB_ID,
} from '../_constants/exploreTabs';

const DEBOUNCE_DELAY_MS = 300;

export const normalizeExploreKeyword = (keyword: string) =>
  keyword.trim().replace(/\s+/g, ' ');

export const useWhiskeyExploreSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sourceTabId = parseExploreTabId(searchParams.get('tab'));
  const initialKeyword =
    sourceTabId === WHISKEY_EXPLORE_TAB_ID
      ? searchParams.getAll('keywords')[0] ?? ''
      : '';

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
    if (parseExploreTabId(searchParams.get('tab')) !== WHISKEY_EXPLORE_TAB_ID) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', WHISKEY_EXPLORE_TAB_ID);
    params.delete('keywords');

    if (debouncedKeyword) {
      params.append('keywords', debouncedKeyword);
    }

    const nextQuery = params.toString();
    if (nextQuery === searchParams.toString()) return;

    router.replace(`${pathname}?${nextQuery}`, { scroll: false });
  }, [debouncedKeyword, pathname, router, searchParams]);

  return {
    inputKeyword,
    debouncedKeyword,
    isTyping: normalizedKeyword !== debouncedKeyword,
    setInputKeyword,
  };
};
