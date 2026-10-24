import type {
  ScenarioAlcoholSelectInput,
  ScenarioAnswerValue,
  ScenarioCandidates,
  ScenarioContext,
  ScenarioPriceUnit,
  ScenarioRangeInput,
  ScenarioStepRequest,
} from './model';
import {
  mockQuestionnaire,
  type MockQuestionOption,
} from './mockQuestionnaire';

/** 테스트용 ID이며 실제 서버의 그룹·시나리오 ID가 아니다. 호출부가 명시적으로 주입한다. */
export const MOCK_SCENARIO_CONTEXT: ScenarioContext = {
  groupId: 1,
  scenarioId: 1,
};

interface MockScenarioChoiceInput {
  kind: 'choice';
  choices: MockQuestionOption[];
  allowAny: boolean;
}

interface MockScenarioPriceUnitOptions {
  unit: ScenarioPriceUnit;
  label: string;
  choices: MockQuestionOption[];
}

interface MockScenarioPriceInput {
  kind: 'price-select';
  units: MockScenarioPriceUnitOptions[];
  allowAny: boolean;
}

/** 목 전용 원본 응답. Product API DTO를 가정하지 않는다. */
export interface MockScenarioQuestion {
  id: number;
  title: string;
  input:
    | MockScenarioChoiceInput
    | ScenarioRangeInput
    | ScenarioAlcoholSelectInput
    | MockScenarioPriceInput;
}

export interface MockScenarioStepResponse {
  question: MockScenarioQuestion | null;
  candidates: ScenarioCandidates | null;
  completed: boolean;
}

// 진행 UI 검증용 작은 fixture. 실제 추천 점수·가격·향 조건을 계산하지 않는다.
const candidates = [
  { id: 247, name: '글렌피딕 12년', imageUrl: null, kindId: 'single-malt' },
  { id: 7007, name: '듀어스 12년', imageUrl: null, kindId: 'blended' },
  { id: 575, name: '메이커스 마크', imageUrl: null, kindId: 'bourbon' },
];

function choiceInput(options: MockQuestionOption[]): MockScenarioChoiceInput {
  return {
    kind: 'choice',
    choices: options.filter(({ id }) => id !== 'any'),
    allowAny: options.some(({ id }) => id === 'any'),
  };
}

function acceptsAnswer(
  input: MockScenarioQuestion['input'],
  value: ScenarioAnswerValue,
): boolean {
  switch (input.kind) {
    case 'choice':
      return value.kind === 'any'
        ? input.allowAny
        : value.kind === 'choice' &&
            input.choices.some(({ id }) => id === value.choiceId);
    case 'range':
      return value.kind === 'any'
        ? input.allowAny
        : value.kind === 'range' &&
            Number.isFinite(value.min) &&
            Number.isFinite(value.max) &&
            input.min <= value.min &&
            value.min <= value.max &&
            value.max <= input.max;
    case 'alcohol-select':
      return (
        value.kind === 'alcohols' &&
        value.alcoholIds.length <= input.maxSelections &&
        value.alcoholIds.every((id) => Number.isInteger(id) && id > 0) &&
        new Set(value.alcoholIds).size === value.alcoholIds.length
      );
    case 'price-select': {
      if (value.kind !== 'price') return false;
      const unit = input.units.find((item) => item.unit === value.unit);
      if (!unit) return false;
      const { selection } = value;
      return selection.kind === 'any'
        ? input.allowAny
        : unit.choices.some(({ id }) => id === selection.choiceId);
    }
    default:
      return false;
  }
}

/** 누적 답변만으로 계산한다. 사용자별 진행 상태나 타이머는 두지 않는다. */
export async function getMockScenarioStep(
  { context, answers }: ScenarioStepRequest,
  signal?: AbortSignal,
): Promise<MockScenarioStepResponse> {
  signal?.throwIfAborted();
  if (
    context.groupId !== MOCK_SCENARIO_CONTEXT.groupId ||
    context.scenarioId !== MOCK_SCENARIO_CONTEXT.scenarioId
  ) {
    throw new Error('목에서 지원하지 않는 시나리오입니다.');
  }

  const { levels, kinds, axes, americanAxes, abvs, prices } = mockQuestionnaire;
  const level = answers[0]?.value;
  const kind = answers[2]?.value;
  const kindId = kind?.kind === 'choice' ? kind.choiceId : undefined;
  const american = kindId === 'bourbon' || kindId === 'rye';
  const questions: MockScenarioQuestion[] = [
    {
      id: 101,
      title: '알겠습니다.\n위스키는 얼마나 드셔보셨어요?',
      input: choiceInput(levels),
    },
    {
      id: 102,
      title:
        level?.kind === 'choice' && level.choiceId === 'beginner'
          ? '드셔본 게 없으시면 그냥 넘어가셔도 됩니다.\n혹시 이름만 들어본 술이라도 있으신가요?'
          : '그중에 괜찮았던 게 있나요?\n이름을 적으시면 그 결에 가까운 쪽으로 찾아드려요.',
      input: { kind: 'alcohol-select', maxSelections: 3 },
    },
    {
      id: 103,
      title:
        '종류는 어떤 쪽이 좋으세요?\n잘 모르시면 상관없어요로 두셔도 됩니다.',
      input: choiceInput(kinds),
    },
    {
      id: kindId === 'bourbon' ? 204 : kindId === 'rye' ? 304 : 104,
      title:
        '오늘은 어떤 결로 가실까요?\n한 가지만 잡으면 나머지는 제가 맞춰 드립니다.',
      input: choiceInput(
        american
          ? americanAxes.filter(
              ({ id }) => kindId !== 'rye' || id !== 'soft-wheat',
            )
          : axes,
      ),
    },
    {
      id: 105,
      title:
        '도수는 어느 정도가 좋으신가요?\n높을수록 향은 진하지만 부담도 큽니다.',
      input: choiceInput(abvs),
    },
    {
      id: 106,
      title:
        '예산은 어느 정도로 보세요?\n한 잔 값은 바마다 달라서 대략으로 말씀드릴게요.',
      input: {
        kind: 'price-select',
        units: [
          {
            unit: 'glass',
            label: '바에서 한 잔',
            choices: prices.glass.filter(({ id }) => id !== 'any'),
          },
          {
            unit: 'bottle',
            label: '병으로 살 때',
            choices: prices.bottle.filter(({ id }) => id !== 'any'),
          },
        ],
        allowAny: true,
      },
    },
  ];

  for (const [index, answer] of answers.entries()) {
    const question = questions[index];
    if (
      !question ||
      answer.questionId !== question.id ||
      !acceptsAnswer(question.input, answer.value)
    ) {
      throw new Error('현재 질문 경로 또는 보기에 맞지 않는 답변입니다.');
    }
  }

  // 종류 답변 이후부터 중간 후보 제공. 라이 경로는 빈 결과를 재현한다.
  const items = candidates
    .filter((item) => kindId === undefined || item.kindId === kindId)
    .map(({ id, name, imageUrl }) => ({ id, name, imageUrl }));
  const question = questions[answers.length] ?? null;
  return {
    question,
    candidates:
      answers.length >= 3 ? { items, totalCount: items.length } : null,
    completed: question === null,
  };
}
