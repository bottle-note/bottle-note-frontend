import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: '리프레시 토큰이 존재하지 않습니다.' },
        { status: 400 },
      );
    }

    // 토큰 갱신 요청
    const response = await fetch(`${process.env.SERVER_URL}/oauth/reissue`, {
      method: 'POST',
      headers: {
        'refresh-token': refreshToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.json();
      return NextResponse.json(
        { error: `HTTP error! message: ${body.errors.message}` },
        { status: response.status },
      );
    }

    // 새 리프레시 토큰 파싱
    const cookie: string = response.headers.getSetCookie()[0] ?? '';
    const newRefreshToken = (
      cookie
        .split(';')
        .find((item) => item.trim().startsWith('refresh-token=')) as string
    ).split('=')[1];

    const { data } = await response.json();

    return NextResponse.json(
      {
        data: { accessToken: data.accessToken, refreshToken: newRefreshToken },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      `토큰 업데이트 도중 에러가 발생했습니다. 사유: ${(error as Error).message}`,
    );
    return NextResponse.json(
      { error: `토큰 업데이트 도중 에러가 발생했습니다.` },
      { status: 500 },
    );
  }
}
