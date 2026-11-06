/** 화면이 사용할 시나리오. 환경마다 다른 scenarioId 대신 시나리오 목록의 code로 찾는다. */
export interface ScenarioContext {
  code: string;
}

export interface ScenarioStepRequest {
  /** context.code로 찾은 ID. Product API는 ID로 조회·평가한다. */
  scenarioId: number;
  answers: ScenarioAnswer[];
  versionId?: number | null;
  cursor?: string;
}

export interface ScenarioAnswer {
  questionId: number;
  value: ScenarioAnswerValue;
}

export interface ScenarioStepResponse {
  versionId: number;
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
  disabled?: boolean;
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
  nextCursor: string | null;
}

export interface ScenarioCandidate {
  id: number;
  name: string;
  imageUrl: string | null;
  category: string | null;
  abv: string | null;
}
