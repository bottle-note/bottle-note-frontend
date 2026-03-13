import { NextResponse } from 'next/server';
import {
  createSessionResponse,
  readRefreshTokenCookie,
} from '@/lib/auth/server';

export async function GET() {
  try {
    const refreshToken = await readRefreshTokenCookie();

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'No refresh token' },
        { status: 401 },
      );
    }

    return await createSessionResponse(refreshToken);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Session restore failed',
      },
      { status: 401 },
    );
  }
}
