import { NextRequest, NextResponse } from 'next/server';
import { UserData } from '@/types/Auth';
import { AuthApi } from '../AuthApi';

const jwt = require('jsonwebtoken');

export async function POST(req: NextRequest) {
  try {
    const { email, socialType } = await req.json();

    const loginPayload = {
      email: email ?? 'no-email',
      gender: null,
      age: null,
      socialType,
      socialUniqueId: '',
    };

    const tokens = await AuthApi.login(loginPayload);
    const info = jwt.decode(tokens.accessToken) as UserData;

    return NextResponse.json({ tokens, info });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
