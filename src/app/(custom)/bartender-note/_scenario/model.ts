/** 프론트 내부 계약. 실제 Product API의 요청·응답 스키마가 아니다. */
export interface ScenarioContext {
  groupId: number;
  scenarioId: number;
}

export interface ScenarioStepRequest {
  context: ScenarioContext;
  answers: ScenarioAnswer[];
}

export interface ScenarioAnswer {
  questionId: number;
  value: ScenarioAnswerValue;
}

export interface ScenarioStepResponse {
  question: ScenarioQuestion | null;
  candidates: ScenarioCandidates | null;
  completed: boolean;
}

export interface ScenarioQuestion {
  id: number;
  prompt: string;
  input: ScenarioInput;
}

export interface ScenarioOption {
  id: string;
  label: string;
  description?: string;
}

export interface ScenarioChoiceInput {
  kind: 'choice';
  options: ScenarioOption[];
  allowAny: boolean;
}

export interface ScenarioRangeInput {
  kind: 'range';
  min: number;
  max: number;
  step: number;
  unit?: string;
  allowAny: boolean;
}

/** 기존 UX 검증을 위한 목 확장. 현재 Admin 입력 종류에는 없다. */
export interface ScenarioAlcoholSelectInput {
  kind: 'alcohol-select';
  maxSelections: number;
}

export type ScenarioPriceUnit = 'glass' | 'bottle';

export interface ScenarioPriceUnitOptions {
  unit: ScenarioPriceUnit;
  label: string;
  options: ScenarioOption[];
}

/** 기존 UX 검증을 위한 목 확장. 현재 Admin 입력 종류에는 없다. */
export interface ScenarioPriceSelectInput {
  kind: 'price-select';
  units: ScenarioPriceUnitOptions[];
  allowAny: boolean;
}

export type ScenarioInput =
  | ScenarioChoiceInput
  | ScenarioRangeInput
  | ScenarioAlcoholSelectInput
  | ScenarioPriceSelectInput;

export interface ScenarioChoiceAnswer {
  kind: 'choice';
  choiceId: string;
}

export interface ScenarioRangeAnswer {
  kind: 'range';
  min: number;
  max: number;
}

export interface ScenarioAnyAnswer {
  kind: 'any';
}

export interface ScenarioAlcoholsAnswer {
  kind: 'alcohols';
  alcoholIds: number[];
}

export interface ScenarioPriceAnswer {
  kind: 'price';
  unit: ScenarioPriceUnit;
  selection: ScenarioChoiceAnswer | ScenarioAnyAnswer;
}

export type ScenarioAnswerValue =
  | ScenarioChoiceAnswer
  | ScenarioRangeAnswer
  | ScenarioAnyAnswer
  | ScenarioAlcoholsAnswer
  | ScenarioPriceAnswer;

export interface ScenarioCandidates {
  items: ScenarioCandidate[];
  totalCount: number;
}

export interface ScenarioCandidate {
  id: number;
  name: string;
  imageUrl: string | null;
}
