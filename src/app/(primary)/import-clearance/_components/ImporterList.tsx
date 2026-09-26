'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import List from '@/components/feature/List/List';
import Button from '@/components/ui/Button/Button';
import {
  GuestListGate,
  useGuestPagedSession,
} from '@/components/feature/auth/GuestListGate';
import { useTabbedListPageSearch } from '@/components/feature/TabbedListPage/TabbedListPageHeader';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { MfdsApi } from '@/api/mfds/mfds.api';
import type { MfdsImporter } from '@/api/mfds/types';
import ImporterFilter from './ImporterFilter';
import ImporterListItem from './ImporterListItem';

const PAGE_SIZE = 20;
const GUEST_PAGE_SIZE = 12;

export default function ImporterList() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSearchActive, onSearchActiveChange } = useTabbedListPageSearch();
  const { isLoggedIn, isGuest, pageSize } = useGuestPagedSession(
    PAGE_SIZE,
    GUEST_PAGE_SIZE,
  );
  const [inputKeyword, setInputKeyword] = useState(() =>
    normalizeKeyword(searchParams.get('keyword') ?? ''),
  );
  const [keyword, setKeyword] = useState(inputKeyword);
  const urlKeyword = normalizeKeyword(searchParams.get('keyword') ?? '');
  const syncedKeywordRef = useRef(urlKeyword);

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      const query = params.toString();
      if (query === searchParams.toString()) return;

      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const normalizedKeyword = normalizeKeyword(inputKeyword);
    const timer = window.setTimeout(() => {
      setKeyword(normalizedKeyword);
      updateSearchParams({ keyword: normalizedKeyword || null });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [inputKeyword, updateSearchParams]);

  useEffect(() => {
    const keywordFromUrl = urlKeyword;

    if (syncedKeywordRef.current !== keywordFromUrl) {
      syncedKeywordRef.current = keywordFromUrl;
      setInputKeyword(keywordFromUrl);
      setKeyword(keywordFromUrl);
    }
  }, [searchParams, urlKeyword]);

  const {
    data: pages = [],
    error,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    targetRef,
    refetch,
  } = usePaginatedQuery<MfdsImporter[]>({
    queryKey: ['mfds.importers', keyword, pageSize],
    queryFn: async ({ pageParam, signal }) =>
      await MfdsApi.getImporters({
        keyword: keyword || undefined,
        cursor: pageParam,
        size: pageSize,
        signal,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const items = useMemo(
    () => pages?.flatMap((page) => page.data) ?? [],
    [pages],
  );
  const hasLoadedFirstPage = pages !== undefined;
  const isEmpty = hasLoadedFirstPage && !error && items.length === 0;
  const hasNextPageError = Boolean(error) && items.length > 0;
  const shouldGateGuestList = isGuest && items.length > 0;

  const handleReset = () => {
    updateSearchParams({ keyword: null });
  };

  return (
    <div className="min-h-safe-screen bg-bg-layer-default text-fg-neutral">
      <section
        className="w-full px-20 pb-navbar"
        style={{ marginTop: 'var(--logo-header-expanded-height)' }}
      >
        <h1 className="sr-only">수입사</h1>
        <ImporterFilter
          isSearchActive={isSearchActive}
          onSearchActiveChange={onSearchActiveChange}
          keyword={inputKeyword}
          onKeywordChange={setInputKeyword}
          onReset={handleReset}
        />
        <List
          emptyViewText="조건에 맞는 수입사 정보가 없어요."
          isListFirstLoading={isLoading}
          isError={Boolean(error) && items.length === 0}
          isEmpty={isEmpty}
        >
          <List.Section>
            {items.map((item) => (
              <ImporterListItem key={item.id} item={item} />
            ))}
          </List.Section>
        </List>
        {hasNextPageError ? (
          <div className="flex flex-col items-center gap-12 py-24">
            <p className="text-13 text-fg-neutral-muted">
              목록을 더 불러오지 못했어요.
            </p>
            <Button
              type="button"
              onClick={() => refetch()}
              size="md"
              variant="secondary"
            >
              다시 시도
            </Button>
          </div>
        ) : (
          isLoggedIn && <div ref={targetRef} />
        )}
        {shouldGateGuestList && (
          <GuestListGate
            title="더 많은 수입사 정보가 궁금하신가요?"
            description="로그인하고 전체 수입사 정보를 더 확인해보세요."
          />
        )}
        {isFetchingNextPage && (
          <p className="py-16 text-center text-13 text-fg-neutral-muted">
            불러오는 중…
          </p>
        )}
      </section>
    </div>
  );
}

function normalizeKeyword(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}
