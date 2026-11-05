import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import type { ExploreAlcohol } from '@/api/explore/types';
import { ROUTES } from '@/constants/routes';
import { AlcoholRow } from './CandidateList';
import {
  FlowAction,
  FlowNavigation,
  FlowTextAction,
  FlowTextLink,
} from './FlowControls';
import type { AlcoholSelection } from './types';

function similarMeta({
  korCategory,
  rating,
  totalRatingsCount,
}: ExploreAlcohol) {
  return (
    <>
      {korCategory}
      {' · '}
      {totalRatingsCount > 0 && rating > 0 ? (
        <span className="text-fg-rating">★ {rating.toFixed(1)}</span>
      ) : (
        '평가 없음'
      )}
    </>
  );
}

/** 주류 상세에서 고른 태그가 모두 겹치는 위스키. 술을 고르면 내부 상세를 연다. */
export default function SimilarCandidateList({
  query,
  tags,
  onChoose,
  home,
  onLeave,
  emptyAction,
}: {
  query: {
    data?: ExploreAlcohol[];
    isPending: boolean;
    isError: boolean;
    refetch: () => unknown;
  };
  tags: string[];
  onChoose: (selection: AlcoholSelection) => void;
  home: () => void;
  onLeave: () => void;
  /** 겹치는 병이 없을 때 권하는 다른 추천. */
  emptyAction: { label: string; onClick: () => void };
}) {
  if (query.isPending)
    return (
      <div role="status" className="flex flex-col gap-12">
        <span className="text-15">정보를 불러오고 있어요…</span>
        <SkeletonBase height={48} count={3} />
      </div>
    );
  if (query.isError)
    return (
      <>
        <p role="alert" className="m-0 text-15 text-fg-neutral">
          위스키를 불러오지 못했어요. 다시 시도해 주세요.
        </p>
        <FlowAction onClick={() => void query.refetch()}>다시 시도</FlowAction>
        <FlowNavigation>
          <FlowTextAction onClick={home}>처음으로</FlowTextAction>
        </FlowNavigation>
      </>
    );
  const items = query.data ?? [];
  return (
    <>
      {items.length === 0 ? (
        <FlowAction onClick={emptyAction.onClick}>
          {emptyAction.label}
        </FlowAction>
      ) : (
        <>
          <div className="flex flex-col">
            {items.map((alcohol, index) => (
              <AlcoholRow
                key={alcohol.alcoholId}
                rank={index + 1}
                imageUrl={alcohol.alcoholUrlImg}
                name={alcohol.korName}
                meta={similarMeta(alcohol)}
                // 기준이 된 태그를 앞에 두어 왜 골랐는지 보이게 한다
                tags={[
                  ...tags,
                  ...(alcohol.alcoholsTastingTags ?? []).filter(
                    (tag) => !tags.includes(tag),
                  ),
                ]}
                onClick={() =>
                  onChoose({ id: alcohol.alcoholId, source: 'api' })
                }
              />
            ))}
          </div>
        </>
      )}
      <FlowNavigation>
        {items.length > 0 && (
          <FlowTextLink
            href={ROUTES.EXPLORE.WHISKEY_SEARCH(tags.join(' '))}
            onClick={onLeave}
          >
            다른 위스키 더 볼게요
          </FlowTextLink>
        )}
        <FlowTextAction onClick={home}>처음으로</FlowTextAction>
      </FlowNavigation>
    </>
  );
}
