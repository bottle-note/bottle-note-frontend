import { describe, expect, it } from 'vitest';
import { adaptScenarioStep } from './adaptScenarioStep';
import {
  MOCK_SCENARIO_CONTEXT,
  type MockScenarioStepResponse,
} from './mockScenario';
import type {
  ScenarioAnswer,
  ScenarioAnswerValue,
  ScenarioStepResponse,
} from './model';
import { getScenarioStep } from './scenarioApi';

const start = (answers: ScenarioAnswer[] = []) =>
  getScenarioStep({ context: MOCK_SCENARIO_CONTEXT, answers });

/** 화면이 받은 질문 ID로 답변을 누적하는 호출 흐름을 재현한다. */
async function answerThrough(values: ScenarioAnswerValue[]) {
  const answers: ScenarioAnswer[] = [];
  let response = await start();
  for (const value of values) {
    if (!response.question) throw new Error('답할 질문이 없습니다.');
    answers.push({ questionId: response.question.id, value });
    response = await start(answers);
  }
  return { answers, response };
}

const firstAnswers: ScenarioAnswerValue[] = [
  { kind: 'choice', choiceId: 'beginner' },
  { kind: 'alcohols', alcoholIds: [] },
];

function choiceIds(response: ScenarioStepResponse): string[] {
  if (response.question?.input.kind !== 'choice') {
    throw new Error('보기 질문이 아닙니다.');
  }
  return response.question.input.options.map(({ id }) => id);
}

describe('시나리오 목 API의 누적 답변 흐름', () => {
  it('빈 답변은 첫 질문과 표시할 보기를 반환하고 후보 미제공은 null로 구분한다', async () => {
    const response = await start();
    expect(response.completed).toBe(false);
    expect(response.candidates).toBeNull();
    expect(response.question?.prompt).toContain('얼마나 드셔보셨어요?');
    expect(response.question?.input).toMatchObject({
      kind: 'choice',
      allowAny: false,
      options: [
        { id: 'beginner', label: '위스키 잘 몰라요' },
        { id: 'occasional', label: '몇 번 마셔봤어요' },
        { id: 'experienced', label: '자주 마시는 편이에요' },
      ],
    });
  });

  it('마셔본 술·종류·향·도수·병 가격에 답하면 질문이 끝나고 후보를 반환한다', async () => {
    const { answers, response } = await answerThrough([
      { kind: 'choice', choiceId: 'experienced' },
      { kind: 'alcohols', alcoholIds: [247, 575] },
      { kind: 'choice', choiceId: 'bourbon' },
      { kind: 'choice', choiceId: 'soft-wheat' },
      { kind: 'choice', choiceId: 'medium' },
      {
        kind: 'price',
        unit: 'bottle',
        selection: { kind: 'choice', choiceId: 'bottle-50000-100000' },
      },
    ]);

    expect(response).toEqual({
      question: null,
      completed: true,
      candidates: {
        items: [{ id: 575, name: '메이커스 마크', imageUrl: null }],
        totalCount: 1,
      },
    });
    // 같은 요청의 재시도는 이전 호출의 진행 상태에 영향을 받지 않는다.
    await expect(start(answers)).resolves.toEqual(response);
    await expect(start()).resolves.toMatchObject({ completed: false });
  });

  it.each([
    ['single-malt', 'peat-smoke', false, 1],
    ['bourbon', 'vanilla-caramel', true, 1],
    ['rye', 'spice-rye', false, 0],
  ])(
    '%s 종류는 해당 향 보기와 중간 후보 수를 제공한다',
    async (kindId, expectedOption, hasWheat, totalCount) => {
      const { response } = await answerThrough([
        ...firstAnswers,
        { kind: 'choice', choiceId: kindId },
      ]);
      expect(choiceIds(response)).toContain(expectedOption);
      expect(choiceIds(response).includes('soft-wheat')).toBe(hasWheat);
      expect(choiceIds(response)).not.toContain('any');
      expect(response.question?.input).toMatchObject({ allowAny: true });
      expect(response.candidates?.totalCount).toBe(totalCount);
    },
  );

  it('건너뛰기·상관없음을 명시적으로 받고 빈 후보도 정상 완료한다', async () => {
    const { response } = await answerThrough([
      ...firstAnswers,
      { kind: 'choice', choiceId: 'rye' },
      { kind: 'any' },
      { kind: 'any' },
      { kind: 'price', unit: 'glass', selection: { kind: 'any' } },
    ]);
    expect(response).toEqual({
      question: null,
      candidates: { items: [], totalCount: 0 },
      completed: true,
    });

    const { response: unrestricted } = await answerThrough([
      ...firstAnswers,
      { kind: 'any' },
    ]);
    expect(unrestricted.candidates?.totalCount).toBe(3);
  });

  it('앞선 종류를 바꾸면 질문 ID도 바뀌고 옛 경로의 향 답변은 거절한다', async () => {
    const { answers, response: bourbon } = await answerThrough([
      ...firstAnswers,
      { kind: 'choice', choiceId: 'bourbon' },
    ]);
    const changed: ScenarioAnswer[] = [
      ...answers.slice(0, 2),
      {
        questionId: answers[2].questionId,
        value: { kind: 'choice', choiceId: 'rye' },
      },
    ];
    const rye = await start(changed);
    expect(rye.question?.id).not.toBe(bourbon.question?.id);
    await expect(
      start([
        ...changed,
        { questionId: bourbon.question!.id, value: { kind: 'any' } },
      ]),
    ).rejects.toThrow('질문 경로');
    await expect(start(changed.slice(0, 2))).resolves.toMatchObject({
      question: {
        input: {
          kind: 'choice',
          options: expect.arrayContaining([
            { id: 'rye', label: '라이', description: expect.any(String) },
          ]),
        },
      },
    });
  });

  it('지원하지 않는 시나리오·중복 답변·없는 보기·다른 단위의 가격 보기를 거절한다', async () => {
    await expect(
      getScenarioStep({
        context: { ...MOCK_SCENARIO_CONTEXT, scenarioId: 999 },
        answers: [],
      }),
    ).rejects.toThrow('시나리오');

    const { answers } = await answerThrough([firstAnswers[0]]);
    await expect(start([...answers, ...answers])).rejects.toThrow('질문 경로');
    await expect(
      start([
        {
          questionId: answers[0].questionId,
          value: { kind: 'choice', choiceId: 'missing' },
        },
      ]),
    ).rejects.toThrow('보기');
    await expect(
      answerThrough([
        ...firstAnswers,
        { kind: 'any' },
        { kind: 'any' },
        { kind: 'any' },
        {
          kind: 'price',
          unit: 'glass',
          selection: { kind: 'choice', choiceId: 'bottle-under-50000' },
        },
      ]),
    ).rejects.toThrow('보기');
  });

  it('취소된 요청은 응답을 반환하지 않는다', async () => {
    const controller = new AbortController();
    const result = getScenarioStep(
      { context: MOCK_SCENARIO_CONTEXT, answers: [] },
      controller.signal,
    );
    controller.abort();
    await expect(result).rejects.toMatchObject({ name: 'AbortError' });
    await expect(
      getScenarioStep(
        { context: MOCK_SCENARIO_CONTEXT, answers: [] },
        controller.signal,
      ),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('시나리오 응답 경계', () => {
  it('제공된 전체 후보 수를 목록 길이로 바꾸지 않는다', () => {
    const response = adaptScenarioStep({
      completed: true,
      question: null,
      candidates: {
        items: [{ id: 247, name: '글렌피딕 12년', imageUrl: null }],
        totalCount: 10,
      },
    });
    expect(response.candidates?.totalCount).toBe(10);
    expect(response.candidates?.items).toHaveLength(1);
  });

  it('숫자 범위 입력 설정도 표시용 응답으로 전달한다', () => {
    const input = {
      kind: 'range',
      min: 40,
      max: 60,
      step: 1,
      unit: '%',
      allowAny: true,
    } as const;
    expect(
      adaptScenarioStep({
        completed: false,
        candidates: null,
        question: { id: 900, title: '도수를 골라 주세요', input },
      }).question,
    ).toEqual({ id: 900, prompt: '도수를 골라 주세요', input });
  });

  it.each([
    { completed: false, question: null, candidates: null },
    { completed: true, question: null, candidates: null },
    {
      completed: true,
      question: {
        id: 1,
        title: '질문',
        input: { kind: 'choice', choices: [], allowAny: true },
      },
      candidates: { items: [], totalCount: 0 },
    },
    {
      completed: false,
      question: {
        id: 1,
        input: { kind: 'choice', choices: [], allowAny: true },
      },
      candidates: null,
    },
    {
      completed: false,
      question: { id: 1, title: '질문', input: { kind: 'unsupported' } },
      candidates: null,
    },
  ])('질문 정보 누락·모순된 완료 상태·미지원 입력을 거절한다: %j', (raw) => {
    expect(() => adaptScenarioStep(raw as MockScenarioStepResponse)).toThrow();
  });
});
