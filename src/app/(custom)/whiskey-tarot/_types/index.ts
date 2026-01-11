// Flavor Tag 타입
export type FlavorTag = 'Fresh' | 'Sweet' | 'Peat' | 'Strong' | 'Balance';

// 타로 카드 타입
export interface TarotCard {
  id: number;
  name: string; // "The Fool"
  nameKo: string; // "바보"
  flavorTag: FlavorTag; // "Fresh", "Sweet", "Peat", "Strong"
  readingText: string; // 리딩 멘트
  history: string; // 카드의 역사/배경
  image: string; // 카드 이미지 경로
  color: string; // 슬라이드 배경 그라데이션 색상
}

// 위스키 추천 타입
export interface WhiskyRecommend {
  category: FlavorTag;
  name: string; // "Glenmorangie Original"
  nameKo: string; // "글렌모렌지 오리지널"
  description: string; // 위스키 설명
  emoji: string; // 이모지 (임시 이미지 대용)
  whiskyCategory: string; // URL 카테고리 (Single%20Malt, all 등)
  whiskyId: number; // Bottle Note 위스키 ID
}

// API 응답 타입
export interface CardsResponse {
  cards: TarotCard[];
}

export interface RecommendRequest {
  selectedCardIds: number[];
}

export interface RecommendResponse {
  selectedCards: TarotCard[];
  recommendedWhisky: WhiskyRecommend;
  matchReason: string;
  flavorScore: Record<FlavorTag, number>; // 각 태그별 점수
}

// 퀴즈 상태 타입
export type QuizStep =
  | 'intro'
  | 'questioning'
  | 'dealing'
  | 'selecting'
  | 'slides'
  | 'result'
  | 'share';

export interface QuizState {
  step: QuizStep;
  cards: TarotCard[];
  selectedCards: TarotCard[];
  recommendedWhisky: WhiskyRecommend | null;
  matchReason: string;
  currentSlideIndex: number;
}
