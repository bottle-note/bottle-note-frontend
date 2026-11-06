import type { PaginationMeta } from '@/api/_shared/types';

/** Product OpenAPI의 시나리오 DTO. 화면 모델은 route의 _scenario/model.ts에 둔다. */
export interface ScenarioListItemDto {
  scenarioId: number;
  /** 스키마엔 nullable 표시가 없지만 문서 설명과 실제 응답은 코드 미지정 시 null이다. */
  code: string | null;
  title: string;
}

export interface ScenarioSubmittedAnswerDto {
  questionId: number;
  optionId: string;
}

export interface ScenarioEvaluateRequestDto {
  versionId: number;
  answers: ScenarioSubmittedAnswerDto[];
  mode: 'QUESTION' | 'RESULT';
  viewQuestionId?: number;
  cursor?: string;
  size?: number;
}

export interface ScenarioAnswerViewDto extends ScenarioSubmittedAnswerDto {
  label: string;
  applied: boolean;
}

export interface ScenarioOptionDto {
  optionId: string;
  label: string;
  kind: 'CHOICE' | 'NUMBER_RANGE' | 'ANY';
  min: number | null;
  max: number | null;
  minExclusive: boolean;
  candidateCount: number;
  selectable: boolean;
}

export interface ScenarioQuestionDto {
  questionId: number;
  title: string;
  options: ScenarioOptionDto[];
}

export interface ScenarioCandidateDto {
  alcoholId: number;
  korName: string;
  engName: string;
  imageUrl: string | null;
  korCategory: string | null;
  abv: string | null;
}

export interface ScenarioCandidatePageDto {
  content: ScenarioCandidateDto[];
  pagination: PaginationMeta;
}

export interface ScenarioEvaluationResponseDto {
  scenarioId: number;
  title: string;
  versionId: number;
  state: 'QUESTION' | 'USER_FINISHED' | 'SCENARIO_END';
  nextQuestionId: number | null;
  path: number[];
  answers: ScenarioAnswerViewDto[];
  question: ScenarioQuestionDto | null;
  candidateCount: number;
  candidates: ScenarioCandidatePageDto;
}
