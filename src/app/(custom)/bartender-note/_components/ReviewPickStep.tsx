import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import EmptyView from '@/components/ui/Display/EmptyView';
import Label from '@/components/ui/Display/Label';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import StepSearchBar from './StepSearchBar';
import { useAlcoholLookup } from './useAlcoholLookup';

function RetryLine({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center gap-10 text-14 text-fg-neutral-muted">
      <span>{message}</span>
      <button
        type="button"
        className="min-h-40 text-fg-brand underline"
        onClick={onRetry}
      >
        다시 시도
      </button>
    </div>
  );
}

/** 실제 술 검색과 주간 인기 목록에서 리뷰할 술을 고른다. 검색 결과는 끝까지 내리면 다음 페이지를 이어 붙인다. */
export default function ReviewPickStep({
  onPick,
}: {
  onPick: (alcoholId: number) => void;
}) {
  const [query, setQuery] = useState('');
  const lookup = useAlcoholLookup(query);
  const { normalizedQuery, results } = lookup;

  const popular = useQuery({
    queryKey: ['bartender-note', 'popular-alcohols'],
    queryFn: async () =>
      (await AlcoholsApi.getWeeklyViewPopular(6)).data.alcohols,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return (
    <>
      <StepSearchBar
        value={query}
        onValueChange={setQuery}
        onSearch={(value) => {
          setQuery(value);
          lookup.searchNow(value);
        }}
        placeholder="마시고 있는 술 이름 검색"
      />
      {!normalizedQuery && (
        <>
          {popular.isPending && (
            <p className="m-0 text-14 text-fg-neutral-muted" role="status">
              많이 찾은 술을 불러오고 있어요…
            </p>
          )}
          {popular.isError && (
            <RetryLine
              message="많이 찾은 술을 불러오지 못했어요."
              onRetry={() => void popular.refetch()}
            />
          )}
          {popular.data && popular.data.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {popular.data.map((alcohol) => (
                <Label
                  key={alcohol.alcoholId}
                  name={alcohol.korName}
                  styleClass="label-default min-h-32 px-10 py-5 text-13 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
                  onClick={() => onPick(alcohol.alcoholId)}
                />
              ))}
            </div>
          )}
        </>
      )}
      {!!normalizedQuery && (
        <>
          {lookup.searching && (
            <p className="m-0 text-14 text-fg-neutral-muted" role="status">
              술을 찾고 있어요…
            </p>
          )}
          {lookup.firstPageError && (
            <RetryLine
              message="검색 중 문제가 생겼어요."
              onRetry={lookup.retryFirstPage}
            />
          )}
          {lookup.loaded && results.length === 0 && <EmptyView />}
          {results.length > 0 && (
            <div className="flex flex-col">
              {results.map((alcohol) => (
                <button
                  key={alcohol.alcoholId}
                  type="button"
                  className="flex min-h-74 w-full items-center gap-12 border-b border-stroke-neutral-subtle py-10 last:border-b-0 text-left text-fg-neutral transition-colors hover:text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring disabled:opacity-45"
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
          {lookup.isFetchingNextPage && (
            <p className="m-0 text-14 text-fg-neutral-muted" role="status">
              술을 더 불러오고 있어요…
            </p>
          )}
          {lookup.nextPageError && (
            <RetryLine
              message="더 불러오지 못했어요."
              onRetry={lookup.retryNextPage}
            />
          )}
          {lookup.canLoadMore && (
            <div ref={lookup.targetRef} aria-hidden="true" className="h-1" />
          )}
        </>
      )}
    </>
  );
}
