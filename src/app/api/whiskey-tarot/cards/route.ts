import { NextResponse } from 'next/server';

import { CardsResponse } from '@/app/(custom)/whiskey-tarot/_types';
import { TAROT_CARDS } from '@/app/(custom)/whiskey-tarot/_data';

// 배열 셔플 함수
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET() {
  // 카드를 셔플해서 반환
  const shuffledCards = shuffleArray(TAROT_CARDS);

  const response: CardsResponse = {
    cards: shuffledCards,
  };

  return NextResponse.json(response);
}
