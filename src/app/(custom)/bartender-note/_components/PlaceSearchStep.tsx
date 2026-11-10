import { useState } from 'react';
import RecentSearch from '@/components/feature/Search/RecentSearch';
import Button from '@/components/ui/Button/Button';
import EmptyView from '@/components/ui/Display/EmptyView';
import { SearchHistoryService } from '@/lib/SearchHistoryService';
import StepSearchBar from './StepSearchBar';
import type { ReviewPlace } from './types';
import { usePlaceSearch } from './usePlaceSearch';

/** 일반 리뷰의 장소 찾기와 최근 검색어를 함께 쓴다. */
const HISTORY_KEY = 'addressSearchHistory';

function RetryLine({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center gap-10 text-14 text-fg-neutral-muted">
      <span>검색 중 문제가 생겼어요.</span>
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

/** 가게 이름이나 주소로 장소를 찾아 고른다. 검색은 엔터나 돋보기를 눌렀을 때만 한다. */
export default function PlaceSearchStep({
  onPick,
}: {
  onPick: (place: ReviewPlace) => void;
}) {
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('');
  const search = usePlaceSearch(keyword);
  const places = search.data?.pages.flatMap((page) => page.places) ?? [];

  const runSearch = (value: string) => {
    const next = value.trim();
    if (next) new SearchHistoryService(HISTORY_KEY).save(next);
    setKeyword(next);
  };

  return (
    <>
      <StepSearchBar
        value={text}
        placeholder="가게 이름 또는 주소"
        onSearch={runSearch}
        onValueChange={(value) => {
          setText(value);
          if (!value.trim()) setKeyword('');
        }}
      />
      {!keyword && (
        <RecentSearch
          keyValue={HISTORY_KEY}
          handleSearch={(recent) => {
            setText(recent);
            runSearch(recent);
          }}
          className="h-auto px-0"
        />
      )}
      {keyword && search.isPending && (
        <p className="m-0 text-14 text-fg-neutral-muted" role="status">
          장소를 찾고 있어요…
        </p>
      )}
      {keyword && search.isError && !search.data && (
        <RetryLine onRetry={() => void search.refetch()} />
      )}
      {search.data && places.length === 0 && (
        <EmptyView text="검색 결과가 없어요!" />
      )}
      {places.length > 0 && (
        <>
          <p className="m-0 text-13 text-fg-neutral-muted">
            검색 결과 {places.length}곳
          </p>
          <div className="flex flex-col">
            {places.map((place) => (
              <button
                key={`${place.name}-${place.address}`}
                type="button"
                className="flex min-h-64 w-full flex-col justify-center gap-3 border-b border-stroke-neutral-subtle py-10 text-left text-fg-neutral transition-colors last:border-b-0 hover:text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
                onClick={() => onPick(place)}
              >
                <span className="text-14 font-bold leading-18">
                  {place.name}
                  {place.category && (
                    <span className="ml-4 text-12 font-normal text-fg-neutral-muted">
                      {place.category}
                    </span>
                  )}
                </span>
                <small className="text-12 leading-16 text-fg-neutral-muted">
                  {place.address}
                </small>
              </button>
            ))}
          </div>
          {search.isFetchNextPageError ? (
            <RetryLine onRetry={() => void search.fetchNextPage()} />
          ) : (
            search.hasNextPage && (
              <Button
                size="md"
                variant="secondary"
                disabled={search.isFetchingNextPage}
                onClick={() => void search.fetchNextPage()}
              >
                더 보기
              </Button>
            )
          )}
        </>
      )}
    </>
  );
}
