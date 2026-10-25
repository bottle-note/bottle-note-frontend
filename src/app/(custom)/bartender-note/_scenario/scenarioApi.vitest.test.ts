import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScenarioEvaluationResponseDto } from '@/api/scenario/types';
import { adaptScenarioStep } from './adaptScenarioStep';
import { ScenarioApi } from '@/api/scenario/scenario.api';
import { SCENARIO_CONTEXT, mockScenarioApi } from './__fixtures__/scenario';
import { getScenarioStep } from './scenarioApi';

const rawQuestion: ScenarioEvaluationResponseDto = {
  scenarioId: 3,
  title: '실제 계약 fixture',
  versionId: 3,
  state: 'QUESTION',
  nextQuestionId: 11,
  path: [11],
  answers: [],
  candidateCount: 675,
  question: {
    questionId: 11,
    title: '어떤 종류의 위스키를 찾으세요?',
    options: [
      {
        optionId: 'opaque.signed-choice.value',
        label: '싱글 몰트',
        kind: 'CHOICE',
        min: null,
        max: null,
        minExclusive: false,
        candidateCount: 387,
        selectable: true,
      },
      {
        optionId: 'opaque.signed-range.value',
        label: '43% 초과 ~ 46% 이하',
        kind: 'NUMBER_RANGE',
        min: 43,
        max: 46,
        minExclusive: true,
        candidateCount: 32,
        selectable: true,
      },
      {
        optionId: 'opaque.signed-any.value',
        label: '상관없어요',
        kind: 'ANY',
        min: null,
        max: null,
        minExclusive: false,
        candidateCount: 675,
        selectable: true,
      },
      {
        optionId: 'opaque.disabled.value',
        label: '기타',
        kind: 'CHOICE',
        min: null,
        max: null,
        minExclusive: false,
        candidateCount: 0,
        selectable: false,
      },
    ],
  },
  candidates: { content: [], pagination: { hasNext: false, nextCursor: null } },
};

describe('실제 서버 DTO → 화면 모델', () => {
  it('서버가 발급한 모든 종류의 optionId를 기존 choice 보기에 그대로 담는다', () => {
    const response = adaptScenarioStep(rawQuestion);
    expect(response.question).toEqual({
      id: 11,
      prompt: rawQuestion.question!.title,
      input: {
        kind: 'choice',
        allowAny: false,
        options: [
          {
            id: 'opaque.signed-choice.value',
            label: '싱글 몰트',
            description: '387병',
            disabled: false,
          },
          {
            id: 'opaque.signed-range.value',
            label: '43% 초과 ~ 46% 이하',
            description: '32병',
            disabled: false,
          },
          {
            id: 'opaque.signed-any.value',
            label: '상관없어요',
            description: '675병',
            disabled: false,
          },
          {
            id: 'opaque.disabled.value',
            label: '기타',
            description: '0병 · 현재 조건에 맞는 위스키가 없어요',
            disabled: true,
          },
        ],
      },
    });
    expect(response.completed).toBe(false);
    expect(response.candidates).toEqual({
      items: [],
      totalCount: 675,
      nextCursor: null,
    });
  });

  it.each(['SCENARIO_END', 'USER_FINISHED'] as const)(
    '%s는 question=null인 완료 응답으로 변환한다',
    (state) => {
      const response = adaptScenarioStep({
        ...rawQuestion,
        state,
        question: null,
        nextQuestionId: state === 'USER_FINISHED' ? 11 : null,
        candidates: {
          content: [
            {
              alcoholId: 247,
              korName: '글렌피딕 12년',
              engName: 'Glenfiddich',
              imageUrl: null,
              korCategory: '싱글 몰트',
              abv: '40',
            },
          ],
          pagination: { hasNext: true, nextCursor: 'opaque-cursor' },
        },
      });
      expect(response).toEqual({
        versionId: 3,
        question: null,
        completed: true,
        candidates: {
          items: [
            {
              id: 247,
              name: '글렌피딕 12년',
              imageUrl: null,
              category: '싱글 몰트',
              abv: '40',
            },
          ],
          totalCount: 675,
          nextCursor: 'opaque-cursor',
        },
      });
    },
  );

  it('빈 후보도 정상 완료하며 전체 수를 목록 길이로 다시 계산하지 않는다', () => {
    expect(
      adaptScenarioStep({
        ...rawQuestion,
        state: 'SCENARIO_END',
        question: null,
        nextQuestionId: null,
        candidateCount: 0,
      }),
    ).toEqual({
      versionId: 3,
      question: null,
      completed: true,
      candidates: { items: [], totalCount: 0, nextCursor: null },
    });
  });

  it.each([
    { ...rawQuestion, state: 'UNKNOWN' },
    { ...rawQuestion, question: null },
    { ...rawQuestion, state: 'SCENARIO_END' },
    { ...rawQuestion, question: { ...rawQuestion.question, title: undefined } },
    { ...rawQuestion, candidates: null },
    {
      ...rawQuestion,
      question: {
        ...rawQuestion.question,
        options: [{ ...rawQuestion.question!.options[0], kind: 'UNSUPPORTED' }],
      },
    },
  ])('필수 정보 누락·미지원 상태·입력 종류는 오류로 전달한다', (response) => {
    expect(() =>
      adaptScenarioStep(response as ScenarioEvaluationResponseDto),
    ).toThrow();
  });
});

beforeEach(() => mockScenarioApi());
afterEach(() => vi.restoreAllMocks());

describe('실제 시나리오 API 요청 연결', () => {
  it('최초 조회는 GET하고, 이후에는 조회한 버전과 누적 optionId로 평가한다', async () => {
    const first = await getScenarioStep({
      context: SCENARIO_CONTEXT,
      answers: [],
    });
    expect(ScenarioApi.get).toHaveBeenCalledWith(3, undefined);
    expect(ScenarioApi.evaluate).not.toHaveBeenCalled();
    if (first.question?.input.kind !== 'choice')
      throw new Error('보기 질문 필요');
    const choiceId = first.question.input.options[0].id;
    const next = await getScenarioStep({
      context: SCENARIO_CONTEXT,
      versionId: first.versionId,
      answers: [
        { questionId: first.question.id, value: { kind: 'choice', choiceId } },
      ],
    });
    expect(ScenarioApi.evaluate).toHaveBeenCalledWith(
      3,
      {
        versionId: 3,
        answers: [{ questionId: 11, optionId: choiceId }],
        mode: 'QUESTION',
      },
      undefined,
    );
    expect(next.question?.id).toBe(12);
  });

  it('첫 질문으로 돌아와도 기존 버전으로 빈 답변을 평가한다', async () => {
    await getScenarioStep({
      context: SCENARIO_CONTEXT,
      answers: [],
      versionId: 3,
    });
    expect(ScenarioApi.get).not.toHaveBeenCalled();
    expect(ScenarioApi.evaluate).toHaveBeenCalledWith(
      3,
      {
        versionId: 3,
        answers: [],
        mode: 'QUESTION',
      },
      undefined,
    );
  });

  it('버전 없는 복원이나 서버 보기가 아닌 답변은 전송하지 않는다', async () => {
    await expect(
      getScenarioStep({
        context: SCENARIO_CONTEXT,
        answers: [
          {
            questionId: 11,
            value: { kind: 'choice', choiceId: 'signed-option' },
          },
        ],
      }),
    ).rejects.toThrow('버전');
    await expect(
      getScenarioStep({
        context: SCENARIO_CONTEXT,
        versionId: 3,
        answers: [{ questionId: 11, value: { kind: 'any' } }],
      }),
    ).rejects.toThrow('보기');
    expect(ScenarioApi.evaluate).not.toHaveBeenCalled();
  });

  it('결과 더 보기는 같은 버전·누적 답변과 RESULT·cursor를 전송한다', async () => {
    vi.mocked(ScenarioApi.evaluate).mockResolvedValueOnce({
      ...rawQuestion,
      state: 'SCENARIO_END',
      question: null,
      nextQuestionId: null,
    });
    await getScenarioStep({
      context: SCENARIO_CONTEXT,
      versionId: 3,
      answers: [],
      cursor: 'signed-cursor',
    });
    expect(ScenarioApi.evaluate).toHaveBeenCalledWith(
      3,
      {
        versionId: 3,
        answers: [],
        mode: 'RESULT',
        cursor: 'signed-cursor',
      },
      undefined,
    );
  });

  it('취소된 요청은 결과를 전달하지 않는다', async () => {
    const controller = new AbortController();
    const result = getScenarioStep(
      { context: SCENARIO_CONTEXT, answers: [] },
      controller.signal,
    );
    controller.abort();
    await expect(result).rejects.toMatchObject({ name: 'AbortError' });
  });
});
