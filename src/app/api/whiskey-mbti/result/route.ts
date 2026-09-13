import { NextRequest, NextResponse } from 'next/server';

import type { MbtiResultDetail } from '@/app/(custom)/whiskey-mbti/_types';
import { calculateMbtiResult } from '../_lib/calculate';
import { getResultMatch, isMbtiCode, TASTE_LABELS } from '../_lib/results';

type AlcoholResponse = {
  alcohols?: {
    alcoholUrlImg?: unknown;
    korName?: unknown;
    rating?: unknown;
    totalRatingsCount?: unknown;
    alcoholsTastingTags?: unknown;
  };
};

type AlcoholDetail = {
  alcoholUrlImg?: unknown;
  korName: string;
  rating?: unknown;
  totalRatingsCount?: unknown;
  alcoholsTastingTags?: unknown;
};

async function fetchAlcohol(id: number) {
  const baseUrl =
    process.env.INTERNAL_SERVER_URL ?? process.env.NEXT_PUBLIC_SERVER_URL;
  if (!baseUrl) return null;

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, '')}/alcohols/${id}`,
      {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) return null;
    const body: unknown = await response.json();
    const alcohol = (body as { data?: AlcoholResponse }).data?.alcohols;
    if (!alcohol || typeof alcohol.korName !== 'string') return null;
    return alcohol as AlcoholDetail;
  } catch {
    return null;
  }
}

function unavailableWhisky(id: number | null, name: string) {
  return {
    id,
    name,
    imageUrl: null,
    rating: null,
    ratingCount: null,
    tags: [],
    detailAvailable: false,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const result = calculateMbtiResult(
      (body as { answers?: unknown })?.answers,
    );
    if (!result)
      return NextResponse.json(
        { error: '유효하지 않은 답변입니다.' },
        { status: 400 },
      );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 400 },
    );
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!isMbtiCode(code))
    return NextResponse.json(
      { error: '유효하지 않은 결과 코드입니다.' },
      { status: 400 },
    );

  const { type, taste, profile, whisky, isOriginal } = getResultMatch(code);
  if (!profile || !whisky)
    return NextResponse.json(
      { error: '결과를 찾을 수 없습니다.' },
      { status: 404 },
    );

  const alcohol = whisky.id === null ? null : await fetchAlcohol(whisky.id);
  const tasteCopy = {
    A: '맛에서는 과실과 산뜻한 향 쪽에 마음이 기웁니다.',
    B: '맛에서는 달콤함과 풍부한 풍미 쪽에 마음이 기웁니다.',
    C: '맛에서는 스모키함과 개성 있는 여운 쪽에 마음이 기웁니다.',
  } as const;
  const response: MbtiResultDetail = {
    code,
    type,
    taste,
    tasteLabel: TASTE_LABELS[taste],
    tone: profile.tone,
    title: profile.title,
    reason: isOriginal
      ? profile.reason
      : `${profile.dramCopy} ${tasteCopy[taste]} 이번 조합으로 추천하는 한 잔은 ${whisky.name}입니다.`,
    dramCopy: `${profile.dramCopy} ${tasteCopy[taste]}`,
    characterImage: `/images/whiskey-mbti/characters/${code}.webp`,
    whisky: alcohol
      ? {
          id: whisky.id,
          name: alcohol.korName,
          imageUrl:
            typeof alcohol.alcoholUrlImg === 'string'
              ? alcohol.alcoholUrlImg
              : null,
          rating: typeof alcohol.rating === 'number' ? alcohol.rating : null,
          ratingCount:
            typeof alcohol.totalRatingsCount === 'number'
              ? alcohol.totalRatingsCount
              : null,
          tags:
            Array.isArray(alcohol.alcoholsTastingTags) &&
            alcohol.alcoholsTastingTags.every((tag) => typeof tag === 'string')
              ? alcohol.alcoholsTastingTags
              : [],
          detailAvailable: true,
        }
      : unavailableWhisky(whisky.id, whisky.name),
  };
  return NextResponse.json(response);
}
