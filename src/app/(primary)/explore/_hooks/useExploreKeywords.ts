import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { buildKeywordsFromParams } from '../_components/keywordUtils';
import type { SearchKeyword } from '../_components/types';
import {
  parseExploreTabId,
  type ExploreTabId,
} from '../_constants/exploreTabs';

interface UseExploreKeywordsOptions {
  tabId: ExploreTabId;
}

export const useExploreKeywords = ({ tabId }: UseExploreKeywordsOptions) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sourceTabId = parseExploreTabId(searchParams.get('tab'));
  const initialKeywords: SearchKeyword[] =
    sourceTabId === tabId ? buildKeywordsFromParams(searchParams) : [];
  const [keywords, setKeywords] = useState<SearchKeyword[]>(initialKeywords);
  const keywordValues = keywords.map((keyword) => keyword.value);

  // 키워드 변경시 URL 업데이트 (regionId 등 다른 파라미터는 보존)
  useEffect(() => {
    if (parseExploreTabId(searchParams.get('tab')) !== tabId) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    params.delete('keywords');

    keywords.forEach((keyword) => {
      params.append('keywords', keyword.value);
    });

    const nextQuery = params.toString();
    if (nextQuery === searchParams.toString()) {
      return;
    }

    router.replace(`${pathname}?${nextQuery}`, { scroll: false });
  }, [keywords, pathname, router, tabId, searchParams]);

  const handleAddKeyword = useCallback((newKeyword: SearchKeyword) => {
    setKeywords((prev) => {
      if (prev.some((keyword) => keyword.value === newKeyword.value)) {
        return prev;
      }
      return [...prev, newKeyword];
    });
  }, []);

  const handleRemoveKeyword = useCallback((keywordValueToRemove: string) => {
    setKeywords((prev) =>
      prev.filter((keyword) => keyword.value !== keywordValueToRemove),
    );
  }, []);

  return {
    keywords,
    keywordValues,
    handleAddKeyword,
    handleRemoveKeyword,
  };
};
