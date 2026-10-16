import type { AlcoholLookupItem } from '@/api/alcohol/types';
import type { Answers, Step } from './types';
import { OptionList } from './FlowControls';
import LikesStep from './LikesStep';
import type { Whiskey } from '../_data/demo';

const levels = [
  ['위스키 잘 몰라요', '무난하고 평이 좋은 쪽으로 골라 드려요'],
  ['몇 번 마셔봤어요', '익숙한 것과 새로운 것을 섞어 드려요'],
  ['자주 마시는 편이에요', '덜 알려진 것, 도수 있는 것도 넣어 드려요'],
] as const;
const kinds = [
  ['싱글 몰트', '한 증류소의 보리 원액 · 글렌피딕, 맥캘란'],
  ['블렌디드', '여러 원액을 섞은 · 조니워커, 발렌타인'],
  ['버번', '새 오크통의 단맛 · 메이커스 마크, 버팔로 트레이스'],
  ['라이', '호밀의 알싸함 · 불렛 라이, 우드포드 리저브'],
  ['상관없어요', '종류는 따지지 않고 고를게요'],
] as const;
const axes = [
  ['피트·스모키', '모닥불과 바닷바람 같은 향'],
  ['셰리·건과일', '건포도와 초콜릿 같은 깊은 단맛'],
  ['바닐라·꿀', '버번 통에서 오는 바닐라와 꿀의 단맛'],
  ['과일·꽃', '사과와 꽃 같은 산뜻한 향'],
  ['스파이시', '후추와 시나몬 같은 향신료'],
  ['상관없어요', '나머지는 바텐더에게 맡길게요'],
] as const;
const americanAxes = [
  ['바닐라·캐러멜', '새 오크통에서 오는 바닐라 단맛'],
  ['스파이시·호밀', '호밀에서 오는 후추 같은 알싸함'],
  ['체리·과일', '체리와 오렌지 같은 과일 단맛'],
  ['진한 오크·가죽', '오래 숙성한 묵직한 오크 향'],
  ['부드러운·밀', '호밀 대신 밀을 넣은 순한 맛'],
  ['상관없어요', '나머지는 바텐더에게 맡길게요'],
] as const;
const abvs = [
  '43% 이하 · 편하게',
  '44~46% · 적당히',
  '47% 이상 · 세게',
  '상관없어요',
];
const prices = {
  glass: [
    '1.5만 원 이하',
    '1.5~2.5만 원',
    '2.5~4만 원',
    '4만 원 이상',
    '상관없어요',
  ],
  bottle: [
    '5만 원 이하',
    '5~10만 원',
    '10~20만 원',
    '20만 원 이상',
    '상관없어요',
  ],
};

type Props = {
  step: Step;
  answers: Answers;
  updateAnswers: (value: Partial<Answers>) => void;
  whiskies: Whiskey[];
  likedLookups: AlcoholLookupItem[];
  rememberLookup: (item: AlcoholLookupItem) => void;
  move: (next: Step) => void;
};

/** 취향 질문 여섯 가지. 답을 고르면 다음 질문으로, 마지막 답이면 추천으로 간다. */
export default function RecommendationFlow({
  step,
  answers,
  updateAnswers,
  whiskies,
  likedLookups,
  rememberLookup,
  move,
}: Props) {
  const optionList = (items: Parameters<typeof OptionList>[0]['items']) => (
    <OptionList items={items} />
  );
  return (
    <>
      {step === 'level' &&
        optionList(
          levels.map(([title, description]) => ({
            title,
            description,
            action: () => {
              updateAnswers({ level: title });
              move('likes');
            },
          })),
        )}
      {step === 'likes' && (
        <LikesStep
          answers={answers}
          updateAnswers={updateAnswers}
          whiskies={whiskies}
          likedLookups={likedLookups}
          rememberLookup={rememberLookup}
          onNext={() => move('kind')}
        />
      )}
      {step === 'kind' &&
        optionList(
          kinds.map(([title, description]) => ({
            title,
            description,
            action: () => {
              updateAnswers({ kind: title });
              move('axis');
            },
          })),
        )}
      {step === 'axis' &&
        optionList(
          (answers.kind === '버번' || answers.kind === '라이'
            ? americanAxes.filter(
                ([title]) => answers.kind !== '라이' || title !== '부드러운·밀',
              )
            : axes
          ).map(([title, description]) => ({
            title,
            description,
            action: () => {
              updateAnswers({ axis: title });
              move('abv');
            },
          })),
        )}
      {step === 'abv' &&
        optionList(
          abvs.map((title) => ({
            title,
            action: () => {
              updateAnswers({ abv: title });
              move('price');
            },
          })),
        )}
      {step === 'price' && (
        <>
          <div
            className="grid grid-cols-2 gap-4 rounded-lg bg-bg-neutral-weak p-4 [&>button]:min-h-40 [&>button]:rounded-md [&>button]:text-13 [&>button]:text-fg-neutral-muted [&>button[aria-pressed=true]]:bg-bg-brand-weak [&>button[aria-pressed=true]]:font-bold [&>button[aria-pressed=true]]:text-fg-brand"
            role="group"
            aria-label="가격 기준"
          >
            <button
              type="button"
              aria-pressed={answers.unit === 'glass'}
              onClick={() => updateAnswers({ unit: 'glass' })}
            >
              바에서 한 잔
            </button>
            <button
              type="button"
              aria-pressed={answers.unit === 'bottle'}
              onClick={() => updateAnswers({ unit: 'bottle' })}
            >
              병으로 살 때
            </button>
          </div>
          {optionList(
            prices[answers.unit].map((title) => ({
              title,
              action: () => {
                updateAnswers({ price: title });
                move('recommendations');
              },
            })),
          )}
        </>
      )}
    </>
  );
}
