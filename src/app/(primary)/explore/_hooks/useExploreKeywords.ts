import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { SearchKeyword } from '../_components/ExploreSearchBar';
import { buildKeywordsFromParams } from '../_components/keywordUtils';

interface UseExploreKeywordsOptions {
  tabId: string;
}

export const useExploreKeywords = ({ tabId }: UseExploreKeywordsOptions) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialKeywords: SearchKeyword[] =
    buildKeywordsFromParams(searchParams);
  const [keywords, setKeywords] = useState<SearchKeyword[]>(initialKeywords);
  const keywordValues = keywords.map((keyword) => keyword.value);

  // URL 파라미터 변경시 키워드 상태 동기화
  useEffect(() => {
    const nextKeywords = buildKeywordsFromParams(searchParams);
    setKeywords((prev) => {
      if (
        prev.length === nextKeywords.length &&
        prev.every(
          (keyword, index) => keyword.value === nextKeywords[index].value,
        )
      ) {
        return prev;
      }
      return nextKeywords;
    });
  }, [searchParams]);

  // 키워드 변경시 URL 업데이트
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('tab', tabId);

    keywords.forEach((keyword) => {
      params.append('keywords', keyword.value);
    });

    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [keywords, pathname, router, tabId]);

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
