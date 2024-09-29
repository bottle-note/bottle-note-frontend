import { NextRequest, NextResponse } from 'next/server';
import { AuthApi } from '../../AuthApi';

export async function POST(req: NextRequest, res: NextResponse) {
  const refreshToken = await req.json();

  try {
    const newTokens = await AuthApi.renewAccessToken(refreshToken);

    return NextResponse.json(
      { res, data: newTokens },
      {
        status: 200,
      },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
}
