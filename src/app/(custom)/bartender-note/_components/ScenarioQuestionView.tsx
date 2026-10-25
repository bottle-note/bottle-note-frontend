import { useRef, useState } from 'react';
import {
  FlowAction,
  FlowNavigation,
  FlowTextAction,
  OptionList,
} from './FlowControls';
import LikesStep from './LikesStep';
import type {
  ScenarioAnswerValue,
  ScenarioPriceSelectInput,
  ScenarioPriceUnit,
  ScenarioQuestion,
  ScenarioRangeInput,
} from '../_scenario/model';

interface Props {
  question: ScenarioQuestion;
  disabled: boolean;
  onAnswer: (value: ScenarioAnswerValue) => void;
}

function RangeQuestion({
  input,
  disabled,
  onAnswer,
}: { input: ScenarioRangeInput } & Pick<Props, 'disabled' | 'onAnswer'>) {
  const formRef = useRef<HTMLFormElement>(null);
  const [min, setMin] = useState(String(input.min));
  const [max, setMax] = useState(String(input.max));
  const validOrder = Number(min) <= Number(max);
  return (
    <>
      <form
        ref={formRef}
        className="flex flex-col gap-12"
        onSubmit={(event) => {
          event.preventDefault();
          if (disabled || !validOrder) return;
          onAnswer({ kind: 'range', min: Number(min), max: Number(max) });
        }}
      >
        <fieldset
          disabled={disabled}
          className="m-0 grid min-w-0 grid-cols-2 gap-12 border-0 p-0"
        >
          {[
            { label: '최솟값', value: min, change: setMin },
            { label: '최댓값', value: max, change: setMax },
          ].map(({ label, value, change }) => (
            <label key={label} className="flex min-w-0 flex-col gap-8 text-15">
              {label}
              {input.unit ? ` (${input.unit})` : ''}
              <input
                type="number"
                required
                aria-label={label}
                min={input.min}
                max={input.max}
                step={input.step}
                value={value}
                onChange={(event) => change(event.target.value)}
                className="h-46 min-w-0 rounded-lg border border-stroke-neutral-weak bg-bg-neutral-weak px-14 text-16 text-fg-neutral focus-visible:outline-stroke-focus-ring"
              />
            </label>
          ))}
        </fieldset>
        {!validOrder && (
          <p role="alert" className="m-0 text-15 text-fg-neutral">
            최솟값은 최댓값보다 클 수 없어요.
          </p>
        )}
      </form>
      <FlowAction
        disabled={disabled || !validOrder}
        onClick={() => formRef.current?.requestSubmit()}
      >
        다음
      </FlowAction>
      {input.allowAny && (
        <FlowNavigation>
          <FlowTextAction
            disabled={disabled}
            onClick={() => onAnswer({ kind: 'any' })}
          >
            상관없어요
          </FlowTextAction>
        </FlowNavigation>
      )}
    </>
  );
}

function PriceQuestion({
  input,
  disabled,
  onAnswer,
}: { input: ScenarioPriceSelectInput } & Pick<Props, 'disabled' | 'onAnswer'>) {
  const [unit, setUnit] = useState<ScenarioPriceUnit>('glass');
  const current = input.units.find((item) => item.unit === unit);
  return (
    <>
      <div
        role="group"
        aria-label="가격 기준"
        className="grid grid-cols-2 gap-4 rounded-lg bg-bg-neutral-weak p-4 [&>button]:min-h-40 [&>button]:rounded-md [&>button]:text-13 [&>button]:text-fg-neutral-muted [&>button[aria-pressed=true]]:bg-bg-brand-weak [&>button[aria-pressed=true]]:font-bold [&>button[aria-pressed=true]]:text-fg-brand"
      >
        {input.units.map((item) => (
          <button
            key={item.unit}
            type="button"
            disabled={disabled}
            aria-pressed={unit === item.unit}
            onClick={() => setUnit(item.unit)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <OptionList
        disabled={disabled}
        items={[
          ...(current?.options ?? []).map((option) => ({
            id: option.id,
            title: option.label,
            description: option.description,
            action: () =>
              onAnswer({
                kind: 'price',
                unit,
                selection: { kind: 'choice', choiceId: option.id },
              }),
          })),
          ...(input.allowAny
            ? [
                {
                  id: 'any',
                  title: '상관없어요',
                  action: () =>
                    onAnswer({
                      kind: 'price',
                      unit,
                      selection: { kind: 'any' },
                    }),
                },
              ]
            : []),
        ]}
      />
    </>
  );
}

/** 응답의 입력 종류를 표시하고 확정된 답변만 전달한다. 분기·다음 질문은 결정하지 않는다. */
export default function ScenarioQuestionView({
  question,
  disabled,
  onAnswer,
}: Props) {
  const { input } = question;
  switch (input.kind) {
    case 'choice':
      return (
        <OptionList
          disabled={disabled}
          items={[
            ...input.options.map((option) => ({
              id: option.id,
              title: option.label,
              description: option.description,
              disabled: option.disabled,
              action: () => onAnswer({ kind: 'choice', choiceId: option.id }),
            })),
            ...(input.allowAny
              ? [
                  {
                    id: 'any',
                    title: '상관없어요',
                    action: () => onAnswer({ kind: 'any' }),
                  },
                ]
              : []),
          ]}
        />
      );
    case 'range':
      return (
        <RangeQuestion input={input} disabled={disabled} onAnswer={onAnswer} />
      );
    case 'alcohol-select':
      return (
        <LikesStep
          maxSelections={input.maxSelections}
          disabled={disabled}
          onAnswer={(alcoholIds) => onAnswer({ kind: 'alcohols', alcoholIds })}
        />
      );
    case 'price-select':
      return (
        <PriceQuestion input={input} disabled={disabled} onAnswer={onAnswer} />
      );
    default:
      return null;
  }
}
