import { NextRequest, NextResponse } from 'next/server';

import type { MbtiResultDetail } from '@/app/(custom)/whiskey-mbti/_types';
import { calculateMbtiResult } from '../_lib/calculate';
import { getResultMatch, isMbtiCode, TASTE_LABELS } from '../_lib/results';

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

  // 개발 배포도 NODE_ENV=production이고 내부 API 주소도 운영과 같으므로
  // 배포 환경별로 설정된 공개 API 호스트로 구분한다.
  const publicApiUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const isDevelopmentApi =
    !!publicApiUrl &&
    new URL(publicApiUrl).hostname === 'api.development.bottle-note.com';
  const { type, taste, profile, whisky, isOriginal } = getResultMatch(
    code,
    isDevelopmentApi,
  );
  if (!profile || !whisky)
    return NextResponse.json(
      { error: '결과를 찾을 수 없습니다.' },
      { status: 404 },
    );

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
    whisky: { id: whisky.id, name: whisky.name },
  };
  return NextResponse.json(response);
}
