import type { AlcoholLookupItem } from '@/api/alcohol/types';
import type { Answers, Step } from './types';
import { OptionList } from './FlowControls';
import LikesStep from './LikesStep';
import type { Whiskey } from '../_data/demo';
import type { BartenderQuestionnaire } from '../_data/questionnaire';

type Props = {
  questionnaire: BartenderQuestionnaire;
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
  questionnaire,
  step,
  answers,
  updateAnswers,
  whiskies,
  likedLookups,
  rememberLookup,
  move,
}: Props) {
  const { levels, kinds, axes, americanAxes, abvs, prices } = questionnaire;
  const optionList = (items: Parameters<typeof OptionList>[0]['items']) => (
    <OptionList items={items} />
  );
  return (
    <>
      {step === 'level' &&
        optionList(
          levels.map(({ title, description }) => ({
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
          kinds.map(({ title, description }) => ({
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
                ({ title }) =>
                  answers.kind !== '라이' || title !== '부드러운·밀',
              )
            : axes
          ).map(({ title, description }) => ({
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
          abvs.map(({ title }) => ({
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
            prices[answers.unit].map(({ title }) => ({
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
