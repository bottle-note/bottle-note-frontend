import { NextRequest, NextResponse } from 'next/server';
import { createLoginResponse } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      provider: 'kakao-login' | 'apple-login' | 'preview-login';
      accessToken?: string;
      email?: string;
      authorizationCode?: string;
      idToken?: string;
      nonce?: string;
    };

    return await createLoginResponse(payload);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Authentication failed',
      },
      { status: 400 },
    );
  }
}
