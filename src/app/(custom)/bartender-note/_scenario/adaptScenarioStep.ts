import type {
  ScenarioCandidateDto,
  ScenarioEvaluationResponseDto,
  ScenarioOptionDto,
  ScenarioQuestionDto,
} from '@/api/scenario/types';
import type {
  ScenarioCandidate,
  ScenarioOption,
  ScenarioQuestion,
  ScenarioStepResponse,
} from './model';

function adaptOption(option: ScenarioOptionDto): ScenarioOption {
  if (
    typeof option.optionId !== 'string' ||
    !option.optionId ||
    typeof option.label !== 'string' ||
    !['CHOICE', 'NUMBER_RANGE', 'ANY'].includes(option.kind) ||
    typeof option.candidateCount !== 'number' ||
    typeof option.selectable !== 'boolean'
  ) {
    throw new Error('보기 ID·문구·종류·후보 수·선택 가능 여부가 필요합니다.');
  }
  return {
    id: option.optionId,
    label: option.label,
    description: `${option.candidateCount}병${option.selectable ? '' : ' · 현재 조건에 맞는 위스키가 없어요'}`,
    disabled: !option.selectable,
  };
}

function adaptQuestion(question: ScenarioQuestionDto): ScenarioQuestion {
  if (
    typeof question.questionId !== 'number' ||
    typeof question.title !== 'string' ||
    !question.title.trim() ||
    !Array.isArray(question.options)
  ) {
    throw new Error('질문 ID·문구·보기가 필요합니다.');
  }
  return {
    id: question.questionId,
    prompt: question.title,
    input: {
      kind: 'choice',
      options: question.options.map(adaptOption),
      // ANY도 서버가 발급한 optionId를 가진 보기다. 화면에서 별도로 만들지 않는다.
      allowAny: false,
    },
  };
}

function adaptCandidate(candidate: ScenarioCandidateDto): ScenarioCandidate {
  if (
    typeof candidate.alcoholId !== 'number' ||
    typeof candidate.korName !== 'string' ||
    !(candidate.imageUrl === null || typeof candidate.imageUrl === 'string')
  ) {
    throw new Error('후보 ID·이름·이미지 정보가 필요합니다.');
  }
  return {
    id: candidate.alcoholId,
    name: candidate.korName,
    imageUrl: candidate.imageUrl,
    category: candidate.korCategory,
    abv: candidate.abv?.replace(/%$/, '').trim() || null,
  };
}

/** 실제 서버 DTO → 화면 모델. 목·실제 호출 모두 이 변환을 사용한다. */
export function adaptScenarioStep(
  response: ScenarioEvaluationResponseDto,
): ScenarioStepResponse {
  const { state, question, candidateCount, candidates } = response;
  if (
    !['QUESTION', 'USER_FINISHED', 'SCENARIO_END'].includes(state) ||
    (state === 'QUESTION' ? !question : question !== null) ||
    typeof candidateCount !== 'number' ||
    typeof response.versionId !== 'number' ||
    !Array.isArray(candidates?.content) ||
    typeof candidates.pagination?.hasNext !== 'boolean' ||
    !(
      candidates.pagination.nextCursor === null ||
      typeof candidates.pagination.nextCursor === 'string'
    ) ||
    (candidates.pagination.hasNext && !candidates.pagination.nextCursor)
  ) {
    throw new Error('질문·후보와 진행 상태가 일치하지 않습니다.');
  }
  return {
    versionId: response.versionId,
    question: question === null ? null : adaptQuestion(question),
    candidates: {
      items: candidates.content.map(adaptCandidate),
      totalCount: candidateCount,
      nextCursor: candidates.pagination.hasNext
        ? candidates.pagination.nextCursor
        : null,
    },
    completed: state !== 'QUESTION',
  };
}
