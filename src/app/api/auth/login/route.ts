import { NextRequest, NextResponse } from 'next/server';
import { createLoginResponse } from '@/lib/auth/server';
import { loginPayloadSchema } from '@/lib/auth/login-payload';

export async function POST(request: NextRequest) {
  try {
    const parsedPayload = loginPayloadSchema.safeParse(await request.json());

    if (!parsedPayload.success) {
      return NextResponse.json(
        { message: 'Invalid login payload' },
        { status: 400 },
      );
    }

    return await createLoginResponse(parsedPayload.data);
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
