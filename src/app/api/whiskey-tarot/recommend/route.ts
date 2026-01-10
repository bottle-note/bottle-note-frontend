import { NextRequest, NextResponse } from 'next/server';

import {
  TarotCard,
  WhiskyRecommend,
  RecommendRequest,
  RecommendResponse,
  FlavorTag,
} from '@/app/(custom)/whiskey-tarot/_types';
import {
  TAROT_CARDS,
  WHISKY_BY_CATEGORY,
} from '@/app/(custom)/whiskey-tarot/_data';

// Flavor Tag별 점수 계산
function calculateFlavorScore(cards: TarotCard[]): Record<FlavorTag, number> {
  const score: Record<FlavorTag, number> = {
    Fresh: 0,
    Sweet: 0,
    Peat: 0,
    Strong: 0,
    Balance: 0,
  };

  for (const card of cards) {
    score[card.flavorTag]++;
  }

  return score;
}

// 가장 높은 점수의 Flavor Tag 찾기
function findDominantFlavor(score: Record<FlavorTag, number>): FlavorTag {
  const relevantTags: FlavorTag[] = ['Fresh', 'Sweet', 'Peat', 'Strong'];
  const counts = relevantTags.map((tag) => score[tag]);
  const maxCount = Math.max(...counts);

  // 최고 점수를 가진 태그들
  const topTags = relevantTags.filter((tag) => score[tag] === maxCount);

  // 1:1:1 동점 (3장 모두 다른 태그) -> Balance
  if (topTags.length >= 3 || (topTags.length === 2 && maxCount === 1)) {
    return 'Balance';
  }

  // 2:1 또는 3:0 -> 최다 태그 반환
  return topTags[0];
}

// 매칭 이유 생성 함수
function generateMatchReason(
  cards: TarotCard[],
  whisky: WhiskyRecommend,
): string {
  const cardNames = cards.map((c) => c.nameKo).join(', ');

  const flavorDescriptions: Record<FlavorTag, string> = {
    Fresh: '상큼하고 가벼운 시작을',
    Sweet: '달콤하고 풍요로운 휴식을',
    Peat: '깊고 스모키한 고독을',
    Strong: '강렬하고 단단한 의지를',
    Balance: '완벽한 조화를',
  };

  return `${flavorDescriptions[whisky.category]}원하는 당신에게 추천합니다.`;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendRequest = await request.json();
    const { selectedCardIds } = body;

    if (!selectedCardIds || selectedCardIds.length !== 3) {
      return NextResponse.json(
        { error: '3장의 카드를 선택해주세요.' },
        { status: 400 },
      );
    }

    // 선택된 카드 찾기
    const selectedCards = selectedCardIds
      .map((id) => TAROT_CARDS.find((card) => card.id === id))
      .filter((card): card is TarotCard => card !== undefined);

    if (selectedCards.length !== 3) {
      return NextResponse.json(
        { error: '유효하지 않은 카드 ID입니다.' },
        { status: 400 },
      );
    }

    // Flavor Tag 점수 계산
    const flavorScore = calculateFlavorScore(selectedCards);

    // 우세한 Flavor Tag 찾기
    const dominantFlavor = findDominantFlavor(flavorScore);

    // 해당 카테고리의 위스키 가져오기
    const recommendedWhisky = WHISKY_BY_CATEGORY[dominantFlavor];

    // 매칭 이유 생성
    const matchReason = generateMatchReason(selectedCards, recommendedWhisky);

    const response: RecommendResponse = {
      selectedCards,
      recommendedWhisky,
      matchReason,
      flavorScore,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
