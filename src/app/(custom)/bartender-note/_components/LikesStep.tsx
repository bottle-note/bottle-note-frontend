import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import Button from '@/components/ui/Button/Button';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { AlcoholLookupItem } from '@/api/alcohol/types';
import { FlowAction } from './FlowControls';

const normalize = (value: string) => value.trim().replace(/\s+/g, ' ');

interface SelectedAlcohol {
  id: number;
  name: string;
}

interface Props {
  maxSelections: number;
  disabled: boolean;
  onAnswer: (alcoholIds: number[]) => void;
}

/** 검색 응답은 Query, 선택 중인 ID·표시명은 입력 UI에서 관리한다. */
export default function LikesStep({
  maxSelections,
  disabled,
  onAnswer,
}: Props) {
  const [selected, setSelected] = useState<SelectedAlcohol[]>([]);
  const [query, setQuery] = useState('');
  const [lookupQuery, setLookupQuery] = useState('');
  const full = selected.length >= maxSelections;
  const normalizedQuery = normalize(query);

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
    enabled: lookupQuery.length > 0 && !disabled && !full,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const loading =
    !!normalizedQuery && (normalizedQuery !== lookupQuery || lookup.isFetching);
  const results: AlcoholLookupItem[] =
    normalizedQuery === lookupQuery ? lookup.data ?? [] : [];
  const showResults = !!normalizedQuery && !loading && !lookup.isError;

  return (
    <>
      <input
        className="h-46 w-full rounded-lg border border-stroke-neutral-weak bg-bg-neutral-weak px-14 text-16 text-fg-neutral outline-none placeholder:text-fg-placeholder focus-visible:border-stroke-focus-ring focus-visible:ring-2 focus-visible:ring-stroke-focus-ring disabled:cursor-not-allowed disabled:opacity-60"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="마셔본 술 이름 검색"
        aria-label="마셔본 술 이름 검색"
        disabled={full || disabled}
      />
      <p className="m-0 text-13 leading-17 text-fg-neutral-muted">
        {selected.length}/{maxSelections}병 ·{' '}
        {full ? '다른 술을 고르려면 선택한 술을 빼 주세요' : '선택 사항'}
      </p>
      <div className="flex flex-wrap gap-5">
        {selected.map((alcohol) => (
          <button
            type="button"
            key={alcohol.id}
            disabled={disabled}
            className="min-h-40 rounded border border-stroke-brand-solid bg-bg-brand-weak px-9 py-7 text-12 leading-15 text-fg-brand disabled:opacity-60"
            onClick={() =>
              setSelected((current) =>
                current.filter(({ id }) => id !== alcohol.id),
              )
            }
          >
            {alcohol.name} ×
          </button>
        ))}
      </div>
      {loading && (
        <p className="text-14 text-fg-neutral-muted" role="status">
          술을 찾고 있어요…
        </p>
      )}
      {!!normalizedQuery && !loading && lookup.isError && (
        <div
          role="alert"
          className="flex items-center gap-10 text-15 text-fg-neutral"
        >
          <span>검색 중 문제가 생겼어요.</span>
          <Button
            size="md"
            variant="secondary"
            disabled={disabled}
            onClick={() => void lookup.refetch()}
          >
            다시 시도
          </Button>
        </div>
      )}
      {showResults && (
        <>
          <p className="m-0 text-13 text-fg-neutral-muted">
            검색 결과 {results.length}개
          </p>
          {results.length === 0 && (
            <p className="text-15 text-fg-neutral">
              그 이름으로는 못 찾겠네요. 철자를 조금 바꿔 보시겠어요?
            </p>
          )}
          <div className="flex flex-col">
            {results.map((alcohol) => (
              <button
                key={alcohol.alcoholId}
                type="button"
                disabled={
                  disabled ||
                  full ||
                  selected.some(({ id }) => id === alcohol.alcoholId)
                }
                className="flex min-h-74 w-full items-center gap-12 border-b border-stroke-neutral-subtle py-10 text-left text-fg-neutral transition-colors hover:text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring disabled:opacity-60"
                onClick={() => {
                  setSelected((current) => [
                    ...current,
                    { id: alcohol.alcoholId, name: alcohol.korName },
                  ]);
                  setQuery('');
                }}
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
                    {alcohol.korCategoryName}
                    {alcohol.engName ? ` · ${alcohol.engName}` : ''}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      <FlowAction
        disabled={disabled}
        onClick={() => onAnswer(selected.map(({ id }) => id))}
      >
        {selected.length ? '이 술을 기억할게요' : '건너뛸게요'}
      </FlowAction>
    </>
  );
}
