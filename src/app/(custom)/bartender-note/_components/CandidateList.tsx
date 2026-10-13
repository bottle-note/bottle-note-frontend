import Link from 'next/link';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import { ROUTES } from '@/constants/routes';
import type { Answers, Step } from './types';
import { FlowAction, FlowLink } from './FlowControls';
import { WhiskeyRow } from './WhiskeyRow';
import type { PickedAlcohol } from './useBartenderPicks';
import type { Curation, Whiskey } from '../_data/demo';
import type { DemoRecommendation } from '../_data/demoSelection';

export type CandidateStep =
  | 'recommendations'
  | 'similar'
  | 'curation-list'
  | 'favorites';

export const isCandidateStep = (step: Step): step is CandidateStep =>
  step === 'recommendations' ||
  step === 'similar' ||
  step === 'curation-list' ||
  step === 'favorites';

/** 목록의 한 줄. 데모에 없는 찜한 술은 실제 술 상세 페이지로 연결한다. */
type Candidate =
  | { whiskey: Whiskey; hit: string[]; miss: string[] }
  | { alcohol: PickedAlcohol };

type Candidates = {
  heading: string;
  /** 고른 조건 요약. 조건에 맞는 추천이 있을 때만 보여 준다. */
  conditions?: string;
  items: Candidate[];
  emptyText: string;
  priceUnit: 'glass' | 'bottle';
  /** 술을 누르면 추천 이유도 볼 수 있는 목록인지. */
  hasReasons: boolean;
  /** 조건에 맞는 추천 아래에 비슷한 술 보기를 열어 줄지. */
  offersSimilar: boolean;
};

const NO_MATCH_TEXT = '보여 드릴 병이 없어요. 조건을 바꿔 다시 골라 볼까요?';

/** 단계별 목록. 취향 추천, 비슷한 술, 큐레이션, 찜한 술을 같은 모양으로 맞춘다. */
export function getCandidates(
  step: CandidateStep,
  {
    recommendation,
    answers,
    curation,
    whiskies,
    pickedItems,
    hasMorePicks,
  }: {
    recommendation: DemoRecommendation;
    answers: Answers;
    curation?: Curation;
    whiskies: Whiskey[];
    pickedItems: { alcohol: PickedAlcohol; whiskey?: Whiskey }[];
    hasMorePicks: boolean;
  },
): Candidates {
  if (step === 'curation-list') {
    return {
      heading: curation?.title ?? '',
      items: (curation?.whiskeyIds ?? []).flatMap((id) => {
        const whiskey = whiskies.find((item) => item.id === id);
        return whiskey ? [{ whiskey, hit: [], miss: [] }] : [];
      }),
      emptyText: NO_MATCH_TEXT,
      priceUnit: curation?.unit ?? 'glass',
      hasReasons: false,
      offersSimilar: false,
    };
  }
  if (step === 'favorites') {
    return {
      heading: `찜한 술 ${pickedItems.length}${hasMorePicks ? '병 이상' : '병'}`,
      items: pickedItems.map(({ alcohol, whiskey }) =>
        whiskey ? { whiskey, hit: [], miss: [] } : { alcohol },
      ),
      emptyText: '찜한 술이 없어요.',
      priceUnit: answers.unit,
      hasReasons: false,
      offersSimilar: false,
    };
  }

  const { exact, similar, meta } = recommendation;
  // 조건에 맞는 술이 없으면 추천 단계에서도 비슷한 술을 보여 준다.
  const showsSimilar = step === 'similar' || exact.length === 0;
  const whiskeys = showsSimilar ? similar : exact.slice(0, 10);
  const items = whiskeys.map((whiskey) => ({
    whiskey,
    hit: meta.get(whiskey.id)?.hit ?? [],
    miss: showsSimilar ? meta.get(whiskey.id)?.miss ?? [] : [],
  }));
  const headingFor = () => {
    if (exact.length === 0 && items.length === 0) return '추천할 술이 없어요';
    if (showsSimilar) return '비슷한 술';
    return `추천 ${items.length}병`;
  };
  const exactConditions = [
    answers.kind,
    answers.axis,
    answers.abv.split(' · ')[0],
    answers.price,
  ]
    .filter((value) => value && value !== '상관없어요')
    .join(' · ');

  return {
    heading: headingFor(),
    conditions:
      step === 'recommendations' && exact.length > 0
        ? exactConditions
        : undefined,
    items,
    emptyText: NO_MATCH_TEXT,
    priceUnit: answers.unit,
    hasReasons: true,
    offersSimilar:
      step === 'recommendations' &&
      exact.length > 0 &&
      exact.length < 10 &&
      similar.length > 0,
  };
}

export default function CandidateList({
  step,
  candidates,
  curation,
  onChoose,
  move,
  home,
}: {
  step: CandidateStep;
  candidates: Candidates;
  curation?: Curation;
  onChoose: (whiskey: Whiskey) => void;
  move: (next: Step) => void;
  home: () => void;
}) {
  const { heading, conditions, items, emptyText, priceUnit } = candidates;
  return (
    <>
      <p className="m-0 text-13 font-extrabold text-fg-brand">{heading}</p>
      {conditions !== undefined && (
        <p className="m-0 text-13 text-fg-neutral-muted">{conditions}</p>
      )}
      {items.length === 0 && (
        <p className="text-15 text-fg-neutral">{emptyText}</p>
      )}
      <p className="m-0 text-13 text-fg-neutral-muted">
        술을 누르면{' '}
        {candidates.hasReasons ? '추천 이유와 자세한 정보' : '자세한 정보'}를 볼
        수 있어요.
      </p>
      <div className="flex flex-col">
        {items.map((item, index) =>
          'whiskey' in item ? (
            <WhiskeyRow
              key={item.whiskey.id}
              whiskey={item.whiskey}
              rank={index + 1}
              hit={item.hit}
              miss={item.miss}
              showPrice
              priceUnit={priceUnit}
              onClick={() => onChoose(item.whiskey)}
            />
          ) : (
            <Link
              key={item.alcohol.alcoholId}
              href={ROUTES.ALCOHOL.DETAIL(item.alcohol.alcoholId)}
              className="flex min-h-74 w-full items-center gap-12 border-b border-stroke-neutral-subtle py-10 text-left text-fg-neutral transition-colors hover:text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
            >
              <b className="w-14 text-13 text-fg-brand">{index + 1}</b>
              <AlcoholImage
                imageUrl={item.alcohol.imageUrl}
                outerHeightClass="h-44"
                outerWidthClass="w-44"
                innerHeightClass="h-36"
                innerWidthClass="w-24"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-3">
                <b className="text-14 font-bold leading-18">
                  {item.alcohol.alcoholKorName}
                </b>
                <small className="text-12 leading-16 text-fg-neutral-muted">
                  {item.alcohol.korCategoryName} · 상세 페이지로 이동
                </small>
              </span>
              <span aria-hidden="true" className="text-fg-neutral-muted">
                ›
              </span>
            </Link>
          ),
        )}
      </div>
      {candidates.offersSimilar && (
        <FlowAction onClick={() => move('similar')}>
          비슷한 술도 볼게요
        </FlowAction>
      )}
      {step === 'curation-list' && (
        <FlowAction onClick={() => move('situation')}>
          다른 주제 볼게요
        </FlowAction>
      )}
      {step === 'curation-list' && curation && (
        <FlowLink href={ROUTES.CURATION.DETAIL(curation.id)}>
          큐레이션 전체 보기
        </FlowLink>
      )}
      <FlowAction onClick={home}>처음으로 갈게요</FlowAction>
    </>
  );
}
