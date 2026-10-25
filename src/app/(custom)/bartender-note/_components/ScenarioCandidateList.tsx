import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import { FlowNavigation, FlowTextAction } from './FlowControls';
import type { ScenarioCandidates } from '../_scenario/model';

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
    <>
      <p className="m-0 text-13 font-extrabold text-fg-brand">
        {candidates.totalCount
          ? `추천 ${candidates.totalCount}병`
          : '추천 후보가 없어요'}
      </p>
      {candidates.items.length < candidates.totalCount && (
        <p className="m-0 text-13 text-fg-neutral-muted">
          전체 {candidates.totalCount}병 중 {candidates.items.length}병을 보여
          드려요.
        </p>
      )}
      {candidates.totalCount === 0 ? (
        <p className="text-15 text-fg-neutral">
          이전 질문으로 돌아가 조건을 바꿔 보세요.
        </p>
      ) : (
        <p className="m-0 text-13 text-fg-neutral-muted">
          술을 누르면 바텐더와 함께 정보를 살펴볼 수 있어요.
        </p>
      )}
      <div className="flex flex-col">
        {candidates.items.map((alcohol, index) => (
          <button
            key={alcohol.id}
            type="button"
            onClick={() => onChoose(alcohol.id)}
            className="flex min-h-74 w-full items-center gap-12 border-b border-stroke-neutral-subtle py-10 text-left text-fg-neutral transition-colors hover:text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
          >
            <b className="w-14 text-13 text-fg-brand">{index + 1}</b>
            <AlcoholImage
              imageUrl={alcohol.imageUrl ?? ''}
              outerHeightClass="h-44"
              outerWidthClass="w-44"
              innerHeightClass="h-36"
              innerWidthClass="w-24"
            />
            <b className="min-w-0 flex-1 text-14 font-bold leading-18">
              {alcohol.name}
            </b>
            <span aria-hidden="true" className="text-20 text-fg-neutral-muted">
              ›
            </span>
          </button>
        ))}
      </div>
      {loadMoreError && (
        <p role="alert" className="m-0 text-15 text-fg-neutral">
          다음 추천을 불러오지 못했어요. 다시 시도하거나 처음부터 시작해 주세요.
        </p>
      )}
      <FlowNavigation>
        {candidates.nextCursor && (
          <FlowTextAction onClick={loadMore} disabled={loadingMore}>
            {loadingMore
              ? '불러오는 중…'
              : loadMoreError
                ? '다시 불러오기'
                : '추천 더 보기'}
          </FlowTextAction>
        )}
        <FlowTextAction onClick={home}>처음으로</FlowTextAction>
      </FlowNavigation>
    </>
  );
}
