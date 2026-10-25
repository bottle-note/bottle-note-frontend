// 테스트 전용 응답 대역에서만 테스트 러너를 사용한다.
// eslint-disable-next-line import/no-extraneous-dependencies
import { vi } from 'vitest';
import type {
  ScenarioCandidateDto,
  ScenarioEvaluationResponseDto,
  ScenarioOptionDto,
  ScenarioQuestionDto,
} from '@/api/scenario/types';
import { ScenarioApi } from '@/api/scenario/scenario.api';
import type { ScenarioContext, ScenarioStepRequest } from '../model';

/** 테스트에서만 사용하는 시나리오와 응답 대역. */
export const SCENARIO_CONTEXT: ScenarioContext = {
  scenarioId: 3,
};

// 서버 추천 품질·서명 검증을 재현하지 않는 작은 fixture다.
const candidates = [
  {
    alcoholId: 247,
    korName: '글렌피딕 12년',
    engName: 'Glenfiddich 12',
    imageUrl: null,
    korCategory: '싱글 몰트',
    abv: '40',
    kindId: 'single-malt',
  },
  {
    alcoholId: 7007,
    korName: '듀어스 12년',
    engName: 'Dewars 12',
    imageUrl: null,
    korCategory: '블렌디드',
    abv: '40',
    kindId: 'blended',
  },
  {
    alcoholId: 575,
    korName: '메이커스 마크',
    engName: 'Makers Mark',
    imageUrl: null,
    korCategory: '버번',
    abv: '45',
    kindId: 'bourbon',
  },
  {
    alcoholId: 504,
    korName: '불렛 라이',
    engName: 'Bulleit Rye',
    imageUrl: null,
    korCategory: '라이',
    abv: '45',
    kindId: 'rye',
  },
] satisfies (ScenarioCandidateDto & { kindId: string })[];

const optionId = (questionId: number, id: string) => `mock:${questionId}:${id}`;

function option(
  questionId: number,
  id: string,
  label: string,
  candidateCount: number,
  range?: readonly [min: number, max: number, minExclusive: boolean],
): ScenarioOptionDto {
  return {
    optionId: optionId(questionId, id),
    label,
    kind: id === 'any' ? 'ANY' : range ? 'NUMBER_RANGE' : 'CHOICE',
    min: range?.[0] ?? null,
    max: range?.[1] ?? null,
    minExclusive: range?.[2] ?? false,
    candidateCount,
    selectable: candidateCount > 0,
  };
}

/** 실제 Product DTO를 반환한다. 진행은 누적 답변만으로 계산한다. */
export async function getScenarioFixture(
  { context, answers }: ScenarioStepRequest,
  signal?: AbortSignal,
): Promise<ScenarioEvaluationResponseDto> {
  signal?.throwIfAborted();
  if (context.scenarioId !== SCENARIO_CONTEXT.scenarioId) {
    throw new Error('목에서 지원하지 않는 시나리오입니다.');
  }
  const kindValue = answers[0]?.value;
  const kindId =
    kindValue?.kind === 'choice'
      ? candidates.find(
          ({ kindId }) => optionId(11, kindId) === kindValue.choiceId,
        )?.kindId
      : undefined;
  const items = candidates.filter(
    (item) => kindId === undefined || item.kindId === kindId,
  );
  const count = items.length;
  const american = kindId === 'bourbon' || kindId === 'rye';
  const unitValue = answers[3]?.value;
  const bottle =
    unitValue?.kind === 'choice' &&
    unitValue.choiceId === optionId(15, 'bottle');
  const questions: ScenarioQuestionDto[] = [
    {
      questionId: 11,
      title: '어떤 종류의 위스키를 찾으세요?',
      options: [
        option(11, 'single-malt', '싱글 몰트', 1),
        option(11, 'blended', '블렌디드', 1),
        option(11, 'bourbon', '버번', 1),
        option(11, 'rye', '라이', 1),
        option(11, 'any', '상관없어요', candidates.length),
        option(11, 'other', '기타', 0),
      ],
    },
    american
      ? {
          questionId: 13,
          title: '버번·라이에서 어떤 맛을 원하세요?',
          options: [
            option(13, 'vanilla-caramel', '바닐라·캐러멜', count),
            option(13, 'spice-rye', '스파이시·호밀', count),
            option(13, 'cherry-fruit', '체리·과일', count),
            option(13, 'oak-leather', '진한 오크·가죽', count),
            option(13, 'soft-wheat', '부드러운·밀', count),
            option(13, 'any', '상관없어요', count),
          ].filter(
            ({ optionId: id }) =>
              kindId !== 'rye' || id !== optionId(13, 'soft-wheat'),
          ),
        }
      : {
          questionId: 12,
          title: '어떤 맛을 원하세요?',
          options: [
            option(12, 'peat-smoke', '피트·스모키', count),
            option(12, 'sherry-fruit', '셰리·건과일', count),
            option(12, 'vanilla-honey', '바닐라·꿀', count),
            option(12, 'fruit-floral', '과일·꽃', count),
            option(12, 'spice', '스파이시', count),
            option(12, 'any', '상관없어요', count),
          ],
        },
    {
      questionId: 14,
      title: '원하는 도수 범위를 골라 주세요.',
      options: [
        option(14, 'low', '43% 이하 · 편하게', count, [0, 43, false]),
        option(14, 'medium', '44~46% · 적당히', count, [43, 46, true]),
        option(14, 'high', '47% 이상 · 세게', count, [46, 100, true]),
        option(14, 'any', '상관없어요', count),
      ],
    },
    {
      questionId: 15,
      title: '한 잔으로 드실 건가요, 한 병을 구매하실 건가요?',
      options: [
        option(15, 'glass', '잔', count),
        option(15, 'bottle', '병', count),
      ],
    },
    bottle
      ? {
          questionId: 17,
          title: '한 병 예산 범위를 골라 주세요.',
          options: [
            option(17, 'bottle-under-50000', '5만 원 이하', count, [
              0,
              50000,
              false,
            ]),
            option(17, 'bottle-50000-100000', '5~10만 원', count, [
              50000,
              100000,
              true,
            ]),
            option(17, 'bottle-100000-200000', '10~20만 원', count, [
              100000,
              200000,
              true,
            ]),
            option(17, 'bottle-over-200000', '20만 원 이상', count, [
              200000,
              1000000000,
              true,
            ]),
            option(17, 'any', '상관없어요', count),
          ],
        }
      : {
          questionId: 16,
          title: '한 잔 예산 범위를 골라 주세요.',
          options: [
            option(16, 'glass-under-15000', '1.5만 원 이하', count, [
              0,
              15000,
              false,
            ]),
            option(16, 'glass-15000-25000', '1.5~2.5만 원', count, [
              15000,
              25000,
              true,
            ]),
            option(16, 'glass-25000-40000', '2.5~4만 원', count, [
              25000,
              40000,
              true,
            ]),
            option(16, 'glass-over-40000', '4만 원 이상', count, [
              40000,
              1000000000,
              true,
            ]),
            option(16, 'any', '상관없어요', count),
          ],
        },
  ];

  const accepted: ScenarioEvaluationResponseDto['answers'] = [];
  for (const [index, answer] of answers.entries()) {
    const current = questions[index];
    const value = answer.value;
    const selected =
      value.kind === 'choice'
        ? current?.options.find((option) => option.optionId === value.choiceId)
        : undefined;
    if (
      !current ||
      current.questionId !== answer.questionId ||
      !selected?.selectable
    ) {
      throw new Error('현재 질문 경로 또는 보기에 맞지 않는 답변입니다.');
    }
    accepted.push({
      questionId: answer.questionId,
      optionId: selected.optionId,
      label: selected.label,
      applied: true,
    });
  }
  const current = questions[answers.length] ?? null;
  return {
    scenarioId: context.scenarioId,
    title: '바텐더 추천 목 시나리오',
    versionId: 3,
    state: current ? 'QUESTION' : 'SCENARIO_END',
    nextQuestionId: current?.questionId ?? null,
    path: [
      ...answers.map(({ questionId }) => questionId),
      ...(current ? [current.questionId] : []),
    ],
    answers: accepted,
    question: current,
    candidateCount: count,
    candidates: {
      content: current
        ? []
        : items.map(
            ({ alcoholId, korName, engName, imageUrl, korCategory, abv }) => ({
              alcoholId,
              korName,
              engName,
              imageUrl,
              korCategory,
              abv,
            }),
          ),
      pagination: { hasNext: false, nextCursor: null },
    },
  };
}

/** 화면 테스트에서도 실제 HTTP 경계 바로 앞까지는 제품 코드를 사용한다. */
export function mockScenarioApi() {
  vi.spyOn(ScenarioApi, 'get').mockImplementation((scenarioId, signal) =>
    getScenarioFixture({ context: { scenarioId }, answers: [] }, signal),
  );
  vi.spyOn(ScenarioApi, 'evaluate').mockImplementation(
    (scenarioId, request, signal) => {
      if (request.versionId !== 3)
        return Promise.reject(new Error('시나리오 버전 불일치'));
      return getScenarioFixture(
        {
          context: { scenarioId },
          answers: request.answers.map(({ questionId, optionId }) => ({
            questionId,
            value: { kind: 'choice', choiceId: optionId },
          })),
        },
        signal,
      );
    },
  );
}
