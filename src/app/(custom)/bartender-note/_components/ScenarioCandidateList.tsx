import { ChevronRight } from 'lucide-react';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import Button from '@/components/ui/Button/Button';
import type { ScenarioCandidates } from '../_scenario/model';

const STAGGERED_ROWS = 8;

/** 서버가 정한 후보 순서를 그대로 표시한다. 술 선택은 바텐더 내부 상세로 이어진다. */
export default function ScenarioCandidateList({
  candidates,
  onChoose,
  home,
  loadMore,
  loadingMore,
  loadMoreError,
}: {
  candidates: ScenarioCandidates;
  onChoose: (id: number) => void;
  home: () => void;
  loadMore: () => void;
  loadingMore: boolean;
  loadMoreError: boolean;
}) {
  return (
    <div className="space-y-12">
      <p className="m-0 text-13 font-extrabold text-fg-brand">
        {candidates.totalCount ? '바텐더가 고른 술' : '추천 후보가 없어요'}
      </p>
      {candidates.totalCount === 0 ? (
        <p className="text-15 text-fg-neutral">
          이전 질문으로 돌아가 조건을 바꿔 보세요.
        </p>
      ) : (
        <p className="m-0 text-13 text-fg-neutral-muted">
          마음에 드는 술을 눌러 자세히 살펴보세요.
        </p>
      )}
      <div className="space-y-4">
        {candidates.items.map((alcohol, index) => {
          const metadata = [alcohol.category, alcohol.abv && `${alcohol.abv}%`]
            .filter(Boolean)
            .join(' · ');
          return (
            <button
              key={alcohol.id}
              type="button"
              onClick={() => onChoose(alcohol.id)}
              // 처음 보이는 행만 차례로 올라온다. 더 불러온 행은 기다리지 않고 바로 붙는다.
              style={
                index < STAGGERED_ROWS
                  ? { animationDelay: `${index * 60}ms` }
                  : undefined
              }
              className="group flex min-h-64 w-full items-center gap-12 border-b border-stroke-neutral-subtle py-10 text-left text-fg-neutral transition-colors last:border-b-0 focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring motion-safe:duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:fill-mode-both"
            >
              <b
                aria-hidden="true"
                className="w-14 shrink-0 text-13 text-fg-brand tabular-nums"
              >
                {index + 1}
              </b>
              <span aria-hidden="true">
                <AlcoholImage
                  imageUrl={alcohol.imageUrl ?? ''}
                  outerHeightClass="h-44"
                  outerWidthClass="w-44"
                  innerHeightClass="h-36"
                  innerWidthClass="w-24"
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-3">
                <b className="break-keep text-15 font-bold leading-20 group-hover:text-fg-brand group-focus-visible:text-fg-brand">
                  {alcohol.name}
                </b>
                {metadata && (
                  <span className="text-12 leading-16 text-fg-neutral-muted">
                    {metadata}
                  </span>
                )}
              </span>
              <ChevronRight
                aria-hidden="true"
                className="h-18 w-18 shrink-0 text-fg-neutral-muted"
              />
            </button>
          );
        })}
      </div>
      {loadMoreError && (
        <p role="alert" className="m-0 text-15 text-fg-neutral">
          다음 추천을 불러오지 못했어요. 다시 시도하거나 처음부터 시작해 주세요.
        </p>
      )}
      <nav aria-label="다른 보기" className="flex items-center gap-12 pt-8">
        {candidates.nextCursor && (
          <Button
            size="md"
            variant="secondary"
            className="min-w-0 flex-[2]"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore
              ? '불러오는 중…'
              : loadMoreError
                ? '다시 불러오기'
                : '추천 더 보기'}
          </Button>
        )}
        <Button
          size="md"
          variant="text"
          className="min-w-0 flex-1"
          onClick={home}
        >
          처음으로
        </Button>
      </nav>
    </div>
  );
}
