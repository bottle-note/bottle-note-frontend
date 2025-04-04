import { NextRequest, NextResponse } from 'next/server';
import { SOCIAL_TYPE } from '@/types/Auth';
import { AuthApi } from '../../AuthApi';

const jwt = require('jsonwebtoken');

const getRedirectUrl = () => `${process.env.CLIENT_URL}/oauth/kakao`;

const fetchKakaoToken = async (code: string) => {
  const clientId = process.env.KAKAO_REST_API_KEY;
  const redirectUri = getRedirectUrl();

  const res = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: String(clientId),
      redirect_uri: String(redirectUri),
      code: String(code),
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return res.json();
};

const fetchKakaoUserInfo = async (accessToken: string) => {
  const res = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  });

  return res.json();
};

export async function POST(req: NextRequest) {
  const code = new URL(req.url).searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code is missing' });
  }

  try {
    // Step 1: Fetch Kakao OAuth token
    const kakaoToken = await fetchKakaoToken(code);

    // Step 2: Fetch Kakao user information
    const userData = await fetchKakaoUserInfo(kakaoToken.access_token);

    // Step 3: Prepare login payload
    const loginPayload = {
      email: userData.kakao_account?.email ?? 'no-email',
      gender: null,
      age: null,
      socialType: SOCIAL_TYPE.KAKAO,
      socialUniqueId: '',
    };

    // Step 4: Log in with the Auth API
    const tokens = await AuthApi.login(loginPayload);
    const info = jwt.decode(tokens.accessToken);

    // TODO: 정제된 세션 데이터 만드는 로직 추가 및 유틸함수로 분리
    return NextResponse.json({ tokens, info });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
