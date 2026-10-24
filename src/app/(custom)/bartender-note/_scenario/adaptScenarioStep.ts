import type {
  MockScenarioQuestion,
  MockScenarioStepResponse,
} from './mockScenario';
import type {
  ScenarioCandidates,
  ScenarioInput,
  ScenarioOption,
  ScenarioQuestion,
  ScenarioStepResponse,
} from './model';
import type { QuestionOption } from '../_data/questionnaire';

function adaptOption(option: QuestionOption): ScenarioOption {
  if (typeof option.id !== 'string' || typeof option.title !== 'string') {
    throw new Error('보기 ID와 문구가 필요합니다.');
  }
  return {
    id: option.id,
    label: option.title,
    ...(option.description !== undefined && {
      description: option.description,
    }),
  };
}

function adaptInput(input: MockScenarioQuestion['input']): ScenarioInput {
  switch (input.kind) {
    case 'choice':
      return {
        kind: 'choice',
        options: input.choices.map(adaptOption),
        allowAny: input.allowAny,
      };
    case 'range':
    case 'alcohol-select':
      return { ...input };
    case 'price-select':
      return {
        kind: 'price-select',
        units: input.units.map(({ unit, label, choices }) => ({
          unit,
          label,
          options: choices.map(adaptOption),
        })),
        allowAny: input.allowAny,
      };
    default:
      throw new Error('지원하지 않는 질문 입력 종류입니다.');
  }
}

function adaptQuestion(question: MockScenarioQuestion): ScenarioQuestion {
  if (
    typeof question.id !== 'number' ||
    typeof question.title !== 'string' ||
    !question.title.trim()
  ) {
    throw new Error('질문 ID와 문구가 필요합니다.');
  }
  return {
    id: question.id,
    prompt: question.title,
    input: adaptInput(question.input),
  };
}

function adaptCandidates(candidates: ScenarioCandidates): ScenarioCandidates {
  if (
    !Array.isArray(candidates.items) ||
    typeof candidates.totalCount !== 'number'
  ) {
    throw new Error('후보 목록과 전체 개수가 필요합니다.');
  }
  return {
    items: candidates.items.map(({ id, name, imageUrl }) => {
      if (
        typeof id !== 'number' ||
        typeof name !== 'string' ||
        !(imageUrl === null || typeof imageUrl === 'string')
      ) {
        throw new Error('후보 ID·이름·이미지 정보가 필요합니다.');
      }
      return { id, name, imageUrl };
    }),
    totalCount: candidates.totalCount,
  };
}

/** 원본 응답을 화면용 모델로 변환하는 유일한 경계. 실제 계약 확정 시 이 매핑을 교체한다. */
export function adaptScenarioStep({
  question,
  candidates,
  completed,
}: MockScenarioStepResponse): ScenarioStepResponse {
  if (
    typeof completed !== 'boolean' ||
    (completed && (question !== null || !candidates)) ||
    (!completed && !question)
  ) {
    throw new Error('질문·후보와 완료 상태가 일치하지 않습니다.');
  }
  return {
    question: question === null ? null : adaptQuestion(question),
    candidates: candidates === null ? null : adaptCandidates(candidates),
    completed,
  };
}
