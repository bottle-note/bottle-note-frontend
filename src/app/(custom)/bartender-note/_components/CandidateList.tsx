import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import { ROUTES } from '@/constants/routes';
import type { AlcoholSelection, Step } from './types';
import {
  FlowAction,
  FlowNavigation,
  FlowTextAction,
  FlowTextLink,
} from './FlowControls';
import { WhiskeyRow } from './WhiskeyRow';
import type { PickedAlcohol } from './useBartenderPicks';
import type { Curation, Whiskey } from '../_data/demo';

export type CandidateStep = 'curation-list' | 'favorites';
export const isCandidateStep = (step: Step): step is CandidateStep =>
  step === 'curation-list' || step === 'favorites';

/** 기존 큐레이션 데모·실제 찜 목록. 모든 술 선택은 내부 상세를 연다. */
export default function CandidateList({
  step,
  curation,
  whiskies,
  pickedItems,
  hasMorePicks,
  onChoose,
  move,
  home,
  onLeave,
  onStartScenario,
}: {
  step: CandidateStep;
  curation?: Curation;
  whiskies: Whiskey[];
  pickedItems: PickedAlcohol[];
  hasMorePicks: boolean;
  onChoose: (selection: AlcoholSelection) => void;
  move: (next: Step) => void;
  home: () => void;
  onLeave: () => void;
  onStartScenario: () => void;
}) {
  const curationItems = (curation?.whiskeyIds ?? []).flatMap((id) => {
    const whiskey = whiskies.find((item) => item.id === id);
    return whiskey ? [whiskey] : [];
  });
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
          ? curationItems.map((whiskey, index) => (
              <WhiskeyRow
                key={whiskey.id}
                whiskey={whiskey}
                rank={index + 1}
                showPrice
                priceUnit={curation?.unit ?? 'glass'}
                onClick={() => onChoose({ id: whiskey.id, source: 'demo' })}
              />
            ))
          : pickedItems.map((alcohol, index) => (
              <button
                key={alcohol.alcoholId}
                type="button"
                onClick={() =>
                  onChoose({ id: alcohol.alcoholId, source: 'api' })
                }
                className="flex min-h-74 w-full items-center gap-12 border-b border-stroke-neutral-subtle py-10 text-left text-fg-neutral transition-colors hover:text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
              >
                <b className="w-14 text-13 text-fg-brand">{index + 1}</b>
                <AlcoholImage
                  imageUrl={alcohol.imageUrl}
                  outerHeightClass="h-44"
                  outerWidthClass="w-44"
                  innerHeightClass="h-36"
                  innerWidthClass="w-24"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-3">
                  <b className="text-14 font-bold leading-18">
                    {alcohol.alcoholKorName}
                  </b>
                  <small className="text-12 leading-16 text-fg-neutral-muted">
                    {alcohol.korCategoryName}
                  </small>
                </span>
                <span
                  aria-hidden="true"
                  className="text-20 text-fg-neutral-muted"
                >
                  ›
                </span>
              </button>
            ))}
      </div>
      {step === 'favorites' && empty && (
        <FlowAction onClick={onStartScenario}>위스키 추천해 주세요</FlowAction>
      )}
      <FlowNavigation>
        {step === 'curation-list' && (
          <FlowTextAction onClick={() => move('situation')}>
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
        <FlowTextAction onClick={home}>처음으로</FlowTextAction>
      </FlowNavigation>
    </>
  );
}
