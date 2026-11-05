import type { ReactNode } from 'react';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import { ROUTES } from '@/constants/routes';
import type { AlcoholSelection, Step } from './types';
import {
  FlowAction,
  FlowNavigation,
  FlowTextAction,
  FlowTextLink,
} from './FlowControls';
import type { PickedAlcohol } from './useBartenderPicks';
import type {
  CurationAlcoholItem,
  useBartenderCuration,
} from './useBartenderCurations';

export type CandidateStep = 'curation-list' | 'favorites';
export const isCandidateStep = (step: Step): step is CandidateStep =>
  step === 'curation-list' || step === 'favorites';

/** 한 줄에 보이는 태그 수 */
const TAG_LIMIT = 4;

export function AlcoholRow({
  rank,
  imageUrl,
  name,
  meta,
  tags = [],
  onClick,
}: {
  rank: number;
  imageUrl?: string;
  name: string;
  meta: ReactNode;
  tags?: string[];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-74 w-full items-center gap-12 border-b border-stroke-neutral-subtle py-10 last:border-b-0 text-left text-fg-neutral transition-colors hover:text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
    >
      <b className="w-14 text-13 text-fg-brand">{rank}</b>
      <AlcoholImage
        imageUrl={imageUrl ?? ''}
        outerHeightClass="h-44"
        outerWidthClass="w-44"
        innerHeightClass="h-36"
        innerWidthClass="w-24"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-3">
        <b className="text-14 font-bold leading-18">{name}</b>
        <small className="text-12 leading-16 text-fg-neutral-muted">
          {meta}
        </small>
        {tags.length > 0 && (
          <span className="flex flex-wrap gap-5">
            {tags.slice(0, TAG_LIMIT).map((tag) => (
              <span
                key={tag}
                className="rounded bg-bg-neutral-weak px-7 py-4 text-11 leading-15 text-fg-neutral-muted"
              >
                {tag}
              </span>
            ))}
          </span>
        )}
      </span>
      <span aria-hidden="true" className="text-20 text-fg-neutral-muted">
        ›
      </span>
    </button>
  );
}

function curationMeta({ alcohol, stats }: CurationAlcoholItem) {
  const abv = alcohol.abv?.replace(/%$/, '').trim();
  const rated =
    typeof stats?.rating === 'number' && stats.totalRatingsCount !== 0;
  return (
    <>
      {[alcohol.korCategory, abv && `${abv}%`].filter(Boolean).join(' · ')}
      {' · '}
      {rated ? (
        <span className="text-fg-rating">★ {stats.rating!.toFixed(1)}</span>
      ) : (
        '평가 없음'
      )}
    </>
  );
}

/** 큐레이션에 담긴 술·찜한 술 목록. 모든 술 선택은 내부 상세를 연다. */
export default function CandidateList({
  step,
  curationDetail,
  pickedItems,
  hasMorePicks,
  onChoose,
  move,
  back,
  home,
  onLeave,
  emptyPicksAction,
}: {
  step: CandidateStep;
  curationDetail: ReturnType<typeof useBartenderCuration>;
  pickedItems: PickedAlcohol[];
  hasMorePicks: boolean;
  onChoose: (selection: AlcoholSelection) => void;
  move: (next: Step) => void;
  /** 돌아갈 단계가 없으면 비워 둔다. */
  back?: () => void;
  home: () => void;
  onLeave: () => void;
  /** 찜이 비었을 때 권하는 추천. 질문 추천이 준비 중이면 큐레이션으로 바뀐다. */
  emptyPicksAction: { label: string; onClick: () => void };
}) {
  const { curation } = curationDetail;
  if (step === 'curation-list' && !curation) {
    return curationDetail.isError ? (
      <>
        <p role="alert" className="m-0 text-15 text-fg-neutral">
          큐레이션을 불러오지 못했어요. 다시 시도해 주세요.
        </p>
        <FlowAction onClick={curationDetail.retry}>다시 시도</FlowAction>
        <FlowNavigation>
          {back && <FlowTextAction onClick={back}>이전으로</FlowTextAction>}
          <FlowTextAction onClick={home}>처음으로</FlowTextAction>
        </FlowNavigation>
      </>
    ) : (
      <div role="status" className="flex flex-col gap-12">
        <span className="text-15">정보를 불러오고 있어요…</span>
        <SkeletonBase height={48} count={3} />
      </div>
    );
  }
  const curationItems = curation?.alcohols ?? [];
  const empty =
    step === 'favorites'
      ? pickedItems.length === 0
      : curationItems.length === 0;
  return (
    <>
      <p className="m-0 text-13 font-extrabold text-fg-brand">
        {step === 'favorites'
          ? `찜한 술 ${pickedItems.length}${hasMorePicks ? '병 이상' : '병'}`
          : curation?.title}
      </p>
      {empty && (
        <p className="text-15 text-fg-neutral">
          {step === 'favorites'
            ? '찜한 술이 없어요.'
            : '보여 드릴 병이 없어요. 다른 주제로 골라 볼까요?'}
        </p>
      )}
      {!empty && (
        <p className="m-0 text-13 text-fg-neutral-muted">
          술을 누르면 자세한 정보를 볼 수 있어요.
        </p>
      )}
      <div className="flex flex-col">
        {step === 'curation-list'
          ? curationItems.map((item, index) => (
              <AlcoholRow
                key={item.alcohol.alcoholId}
                rank={index + 1}
                imageUrl={item.alcohol.imageUrl}
                name={item.alcohol.korName}
                meta={curationMeta(item)}
                tags={item.alcohol.selectedTags}
                onClick={() =>
                  onChoose({ id: item.alcohol.alcoholId, source: 'api' })
                }
              />
            ))
          : pickedItems.map((alcohol, index) => (
              <AlcoholRow
                key={alcohol.alcoholId}
                rank={index + 1}
                imageUrl={alcohol.imageUrl}
                name={alcohol.alcoholKorName}
                meta={alcohol.korCategoryName}
                onClick={() =>
                  onChoose({ id: alcohol.alcoholId, source: 'api' })
                }
              />
            ))}
      </div>
      {step === 'favorites' && empty && (
        <FlowAction onClick={emptyPicksAction.onClick}>
          {emptyPicksAction.label}
        </FlowAction>
      )}
      <FlowNavigation>
        {step === 'curation-list' && (
          <FlowTextAction onClick={() => move('curations')}>
            다른 주제 보기
          </FlowTextAction>
        )}
        {step === 'curation-list' && curation && (
          <FlowTextLink
            href={ROUTES.CURATION.DETAIL(curation.id)}
            onClick={onLeave}
          >
            큐레이션 전체 보기
          </FlowTextLink>
        )}
        {back && <FlowTextAction onClick={back}>이전으로</FlowTextAction>}
        <FlowTextAction onClick={home}>처음으로</FlowTextAction>
      </FlowNavigation>
    </>
  );
}
