export type MbtiTaste = 'A' | 'B' | 'C';
export type MbtiType =
  | 'INTJ'
  | 'INTP'
  | 'ENTJ'
  | 'ENTP'
  | 'INFJ'
  | 'INFP'
  | 'ENFJ'
  | 'ENFP'
  | 'ISTJ'
  | 'ISFJ'
  | 'ESTJ'
  | 'ESFJ'
  | 'ISTP'
  | 'ISFP'
  | 'ESTP'
  | 'ESFP';

export type MbtiCode = `${MbtiType}-${MbtiTaste}`;

export interface MbtiQuestion {
  text: string;
  options: [string, string];
}

export interface MbtiTieQuestion {
  text: string;
  options: string[];
}

export type MbtiResultResponse =
  | { status: 'tie'; question: MbtiTieQuestion }
  | { status: 'complete'; code: MbtiCode };

export interface WhiskyResult {
  id: number | null;
  name: string;
  imageUrl: string | null;
  rating: number | null;
  ratingCount: number | null;
  tags: string[];
  detailAvailable: boolean;
}

export interface MbtiResultDetail {
  code: MbtiCode;
  type: MbtiType;
  taste: MbtiTaste;
  tasteLabel: string;
  tone: string;
  title: string;
  reason: string;
  dramCopy: string;
  characterImage: string;
  whisky: WhiskyResult;
}
