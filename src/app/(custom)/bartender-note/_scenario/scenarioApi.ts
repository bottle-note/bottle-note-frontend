import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { ScenarioApi } from '@/api/scenario/scenario.api';
import { adaptScenarioStep } from './adaptScenarioStep';
import { toDescriptionParagraphs } from './descriptionParagraphs';
import type {
  ScenarioCandidate,
  ScenarioStepRequest,
  ScenarioStepResponse,
} from './model';

/** HTTP 요청 구성과 서버 DTO → 화면 모델 변환을 연결한다. */
export async function getScenarioStep(
  request: ScenarioStepRequest,
  signal?: AbortSignal,
): Promise<ScenarioStepResponse> {
  const { context, answers, versionId, cursor } = request;
  if (versionId == null && (answers.length > 0 || cursor)) {
    throw new Error('답변을 평가하려면 조회한 시나리오 버전이 필요합니다.');
  }
  const submitted = answers.map(({ questionId, value }) => {
    if (value.kind !== 'choice') {
      throw new Error('서버에서 제공한 보기를 선택해 주세요.');
    }
    return { questionId, optionId: value.choiceId };
  });
  const response =
    versionId == null
      ? await ScenarioApi.get(context.scenarioId, signal)
      : await ScenarioApi.evaluate(
          context.scenarioId,
          {
            versionId,
            answers: submitted,
            mode: cursor ? 'RESULT' : 'QUESTION',
            ...(cursor ? { cursor } : {}),
          },
          signal,
        );
  signal?.throwIfAborted();
  const step = adaptScenarioStep(response);
  // 결과 첫 페이지에서만 1위를 크게 보여 준다. 다음 페이지는 목록에 이어 붙기만 한다.
  return step.completed && !cursor ? withLeadDetails(step, signal) : step;
}

/**
 * 1위 후보의 테이스팅 태그와 설명을 술 상세에서 채운다.
 * 상세 조회가 실패해도 결과는 그대로 보여 주고 태그·설명만 비운다.
 *
 * FIXME: 시나리오 후보 응답에 태그·설명이 추가되면 adaptCandidate에서 읽고 이 조회를 지운다.
 */
async function withLeadDetails(
  step: ScenarioStepResponse,
  signal?: AbortSignal,
): Promise<ScenarioStepResponse> {
  const lead = step.candidates?.items[0];
  if (!step.candidates || !lead) return step;
  let details: Pick<ScenarioCandidate, 'tags' | 'descriptionParagraphs'>;
  try {
    const { alcohols } = (await AlcoholsApi.getAlcoholDetails(String(lead.id)))
      .data;
    details = {
      tags: alcohols.alcoholsTastingTags ?? [],
      descriptionParagraphs: toDescriptionParagraphs(alcohols.description),
    };
  } catch {
    return step;
  }
  signal?.throwIfAborted();
  return {
    ...step,
    candidates: {
      ...step.candidates,
      items: [{ ...lead, ...details }, ...step.candidates.items.slice(1)],
    },
  };
}
