import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { AlcoholLookupItem } from '@/api/alcohol/types';

const normalize = (value: string) => value.trim().replace(/\s+/g, ' ');

/** 실제 술 검색과 주간 인기 목록에서 리뷰할 술을 고른다. */
export default function ReviewPickStep({
  onPick,
}: {
  onPick: (alcoholId: number) => void;
}) {
  const [query, setQuery] = useState('');
  const [lookupQuery, setLookupQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(
      () => setLookupQuery(normalize(query)),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [query]);

  const popular = useQuery({
    queryKey: ['bartender-note', 'popular-alcohols'],
    queryFn: async () =>
      (await AlcoholsApi.getWeeklyViewPopular(6)).data.alcohols,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const lookup = useQuery({
    queryKey: ['bartender-note', 'alcohol-lookup', lookupQuery],
    queryFn: ({ signal }) => AlcoholsApi.lookup(lookupQuery, signal),
    enabled: lookupQuery.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const normalizedQuery = normalize(query);
  const searching =
    !!normalizedQuery && (normalizedQuery !== lookupQuery || lookup.isFetching);
  const results: AlcoholLookupItem[] =
    normalizedQuery === lookupQuery ? lookup.data ?? [] : [];

  return (
    <>
      <input
        className="h-46 w-full rounded-lg border border-stroke-neutral-weak bg-bg-neutral-weak px-14 text-16 text-fg-neutral outline-none placeholder:text-fg-placeholder focus-visible:border-stroke-focus-ring focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="마시고 있는 술 이름 검색"
        aria-label="술 이름 또는 종류 검색"
      />
      {!normalizedQuery && (
        <>
          <p className="m-0 text-13 text-fg-neutral-muted">
            또는 이번 주 많이 찾은 술에서 골라 보세요
          </p>
          {popular.isPending && (
            <p className="m-0 text-14 text-fg-neutral-muted" role="status">
              많이 찾은 술을 불러오고 있어요…
            </p>
          )}
          {popular.isError && (
            <div className="flex items-center gap-10 text-14 text-fg-neutral-muted">
              <span>많이 찾은 술을 불러오지 못했어요.</span>
              <button
                type="button"
                className="min-h-40 text-fg-brand underline"
                onClick={() => void popular.refetch()}
              >
                다시 시도
              </button>
            </div>
          )}
          {popular.data && popular.data.length === 0 && (
            <p className="m-0 text-15 text-fg-neutral">
              지금은 많이 찾은 술이 없어요. 이름으로 검색해 주세요.
            </p>
          )}
          {popular.data && popular.data.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {popular.data.map((alcohol) => (
                <button
                  type="button"
                  key={alcohol.alcoholId}
                  className="min-h-40 rounded-full border border-stroke-neutral-weak px-12 text-13 text-fg-neutral focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring disabled:opacity-45"
                  onClick={() => onPick(alcohol.alcoholId)}
                >
                  {alcohol.korName}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {!!normalizedQuery && (
        <>
          {searching && (
            <p className="m-0 text-14 text-fg-neutral-muted" role="status">
              술을 찾고 있어요…
            </p>
          )}
          {!searching && lookup.isError && (
            <div className="flex items-center gap-10 text-14 text-fg-neutral-muted">
              <span>검색 중 문제가 생겼어요.</span>
              <button
                type="button"
                className="min-h-40 text-fg-brand underline"
                onClick={() => void lookup.refetch()}
              >
                다시 시도
              </button>
            </div>
          )}
          {!searching && !lookup.isError && (
            <p className="m-0 text-13 text-fg-neutral-muted">
              검색 결과 {results.length}병
              {results.length === 6 ? ' · 이름을 더 적으면 좁혀져요' : ''}
            </p>
          )}
          {!searching && !lookup.isError && results.length === 0 && (
            <p className="m-0 text-15 text-fg-neutral">
              그 이름으로는 못 찾겠네요. 철자를 조금 바꿔 보시겠어요?
            </p>
          )}
          {!searching && !lookup.isError && results.length > 0 && (
            <div className="flex flex-col">
              {results.map((alcohol) => (
                <button
                  key={alcohol.alcoholId}
                  type="button"
                  className="flex min-h-74 w-full items-center gap-12 border-b border-stroke-neutral-subtle py-10 text-left text-fg-neutral transition-colors hover:text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring disabled:opacity-45"
                  onClick={() => onPick(alcohol.alcoholId)}
                >
                  <AlcoholImage
                    imageUrl={alcohol.imageUrl}
                    outerHeightClass="h-44"
                    outerWidthClass="w-44"
                    innerHeightClass="h-36"
                    innerWidthClass="w-24"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-3">
                    <b className="text-14 font-bold leading-18">
                      {alcohol.korName}
                    </b>
                    <small className="text-12 leading-16 text-fg-neutral-muted">
                      {alcohol.korCategoryName} · {alcohol.korRegion}
                    </small>
                  </span>
                  <span aria-hidden="true" className="text-fg-neutral-muted">
                    ›
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
