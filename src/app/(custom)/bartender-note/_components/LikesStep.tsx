import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { AlcoholLookupItem } from '@/api/alcohol/types';
import type { Answers } from './types';
import { FlowAction } from './FlowControls';
import type { Whiskey } from '../_data/demo';

const MAX_LIKES = 3;

const normalize = (value: string) => value.trim().replace(/\s+/g, ' ');

type Props = {
  answers: Answers;
  updateAnswers: (value: Partial<Answers>) => void;
  whiskies: Whiskey[];
  likedLookups: AlcoholLookupItem[];
  rememberLookup: (item: AlcoholLookupItem) => void;
  onNext: () => void;
};

/** 마셔본 술을 최대 3병까지 고른다. 이름을 적으면 서버 술 목록에서 찾는다. */
export default function LikesStep({
  answers,
  updateAnswers,
  whiskies,
  likedLookups,
  rememberLookup,
  onNext,
}: Props) {
  const [query, setQuery] = useState('');
  const [lookupQuery, setLookupQuery] = useState('');
  const full = answers.likedIds.length >= MAX_LIKES;

  useEffect(() => {
    const timer = window.setTimeout(
      () => setLookupQuery(normalize(query)),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [query]);

  const lookup = useQuery({
    queryKey: ['bartender-note', 'alcohol-lookup', lookupQuery],
    queryFn: ({ signal }) => AlcoholsApi.lookup(lookupQuery, signal),
    enabled: lookupQuery.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const loading =
    !!query.trim() && (normalize(query) !== lookupQuery || lookup.isFetching);
  const results: AlcoholLookupItem[] =
    normalize(query) === lookupQuery ? lookup.data ?? [] : [];
  const failed = !!lookup.error;
  const showResults = !!query && !loading && !failed;

  const like = (id: number) => {
    if (!answers.likedIds.includes(id) && !full)
      updateAnswers({ likedIds: [...answers.likedIds, id] });
    setQuery('');
  };
  const popular = [...whiskies]
    .sort((a, b) =>
      answers.level === '자주 마시는 편이에요'
        ? (b.rating ?? 0) - (a.rating ?? 0)
        : 0,
    )
    .slice(0, 10);

  return (
    <>
      <input
        className="h-46 w-full rounded-lg border border-stroke-neutral-weak bg-bg-neutral-weak px-14 text-16 text-fg-neutral outline-none placeholder:text-fg-placeholder focus-visible:border-stroke-focus-ring focus-visible:ring-2 focus-visible:ring-stroke-focus-ring disabled:cursor-not-allowed disabled:opacity-60"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="마셔본 술 이름 검색"
        aria-label="마셔본 술 이름 검색"
        disabled={full}
      />
      <p className="m-0 text-13 leading-17 text-fg-neutral-muted">
        {full
          ? '3/3병 · 다른 술을 고르려면 선택한 술을 빼 주세요'
          : `${answers.likedIds.length}/3병 · 선택 사항`}
      </p>
      <div className="flex flex-wrap gap-5">
        {answers.likedIds.map((id) => {
          const name =
            likedLookups.find((item) => item.alcoholId === id)?.korName ??
            whiskies.find((whiskey) => whiskey.id === id)?.name;
          return (
            name && (
              <button
                type="button"
                key={id}
                className="rounded border border-stroke-brand-solid bg-bg-brand-weak px-7 py-4 text-12 leading-15 text-fg-brand"
                onClick={() =>
                  updateAnswers({
                    likedIds: answers.likedIds.filter((value) => value !== id),
                  })
                }
              >
                {name} ×
              </button>
            )
          );
        })}
      </div>
      {!query && !full && (
        <div className="flex flex-wrap gap-6">
          {popular.map((whiskey) => (
            <button
              key={whiskey.id}
              type="button"
              className="rounded-full border border-stroke-neutral-weak px-10 py-6 text-13 text-fg-neutral"
              onClick={() => like(whiskey.id)}
            >
              {whiskey.name}
            </button>
          ))}
        </div>
      )}
      {showResults && (
        <p className="m-0 text-13 text-fg-neutral-muted">
          검색 결과 {results.length}개
          {results.length === 6 ? ' · 이름을 더 적으면 좁혀져요' : ''}
        </p>
      )}
      {query && loading && (
        <p className="text-14 text-fg-neutral-muted" role="status">
          술을 찾고 있어요…
        </p>
      )}
      {query && !loading && failed && (
        <div className="flex items-center gap-10 text-14 text-fg-neutral-muted">
          <span>검색 중 문제가 생겼어요.</span>
          <button
            type="button"
            className="text-fg-brand underline"
            onClick={() => void lookup.refetch()}
          >
            다시 시도
          </button>
        </div>
      )}
      {showResults && results.length === 0 && (
        <p className="text-15 text-fg-neutral">
          그 이름으로는 못 찾겠네요. 철자를 조금 바꿔 보시겠어요?
        </p>
      )}
      {showResults && (
        <div className="flex flex-col">
          {results.map((whiskey) => (
            <button
              key={whiskey.alcoholId}
              type="button"
              className="flex min-h-74 w-full items-center gap-12 border-b border-stroke-neutral-subtle py-10 text-left text-fg-neutral transition-colors hover:text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
              onClick={() => {
                if (!answers.likedIds.includes(whiskey.alcoholId) && !full)
                  rememberLookup(whiskey);
                like(whiskey.alcoholId);
              }}
            >
              <AlcoholImage
                imageUrl={whiskey.imageUrl}
                outerHeightClass="h-44"
                outerWidthClass="w-44"
                innerHeightClass="h-36"
                innerWidthClass="w-24"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-3">
                <b className="text-14 font-bold leading-18">
                  {whiskey.korName}
                </b>
                <small className="text-12 leading-16 text-fg-neutral-muted">
                  {whiskey.korCategoryName}
                  {whiskey.engName ? ` · ${whiskey.engName}` : ''}
                </small>
              </span>
            </button>
          ))}
        </div>
      )}
      <FlowAction primary onClick={onNext}>
        {answers.likedIds.length ? '이 술을 기억할게요' : '건너뛸게요'}
      </FlowAction>
    </>
  );
}
