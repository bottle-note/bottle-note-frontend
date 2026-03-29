import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { decodeJwt } from 'jose';
import { AuthApi } from '@/api/auth/auth.api';
import { SOCIAL_TYPE, TokenData, UserData } from '@/api/auth/types';

const REFRESH_TOKEN_COOKIE = 'bn_refresh_token';
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;
const ACCESS_TOKEN_COOKIE = 'bn_access_token';
const TOKEN_EXPIRY_BUFFER_SECONDS = 60;
const DEFAULT_ACCESS_TOKEN_MAX_AGE = 30 * 60;
const isProduction = process.env.NODE_ENV === 'production';

interface LoginPayload {
  provider: 'kakao-login' | 'apple-login' | 'preview-login';
  accessToken?: string;
  email?: string;
  authorizationCode?: string;
  idToken?: string;
  nonce?: string;
}

const createSessionPayload = (tokens: TokenData) => {
  const user = decodeJwt(tokens.accessToken) as UserData;

  return {
    accessToken: tokens.accessToken,
    user,
  };
};

const applyAccessTokenCookie = (
  response: NextResponse,
  accessToken: string | null,
) => {
  if (!accessToken) {
    response.cookies.set({
      name: ACCESS_TOKEN_COOKIE,
      value: '',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return;
  }

  try {
    const payload = decodeJwt(accessToken);
    const exp = payload.exp as number | undefined;
    const maxAge = exp
      ? exp - Math.floor(Date.now() / 1000) - TOKEN_EXPIRY_BUFFER_SECONDS
      : DEFAULT_ACCESS_TOKEN_MAX_AGE;

    if (maxAge <= 0) return;

    response.cookies.set({
      name: ACCESS_TOKEN_COOKIE,
      value: accessToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });
  } catch {
    // JWT 디코딩 실패 시 쿠키 설정 건너뜀
  }
};

export function isAccessTokenValid(accessToken: string): boolean {
  try {
    const payload = decodeJwt(accessToken);
    const exp = payload.exp as number | undefined;

    if (!exp) return false;

    return exp - TOKEN_EXPIRY_BUFFER_SECONDS > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

const applyRefreshTokenCookie = (
  response: NextResponse,
  refreshToken: string | null,
) => {
  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: refreshToken ?? '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: refreshToken ? REFRESH_TOKEN_MAX_AGE : 0,
  });
};

async function loginWithKakao(payload: LoginPayload): Promise<TokenData> {
  if (payload.authorizationCode) {
    const kakaoToken = await AuthApi.server.fetchKakaoToken(
      payload.authorizationCode,
    );

    if (!kakaoToken?.access_token) {
      throw new Error('Kakao access token not found');
    }

    const userData = await AuthApi.server.fetchKakaoUserInfo(
      kakaoToken.access_token,
    );

    if (!userData.kakao_account?.email) {
      throw new Error('Kakao user email not found');
    }

    return AuthApi.server.login({
      email: userData.kakao_account.email,
      gender: null,
      age: null,
      socialType: SOCIAL_TYPE.KAKAO,
      socialUniqueId: String(userData.id),
    });
  }

  if (payload.accessToken) {
    return AuthApi.server.kakaoLogin({ accessToken: payload.accessToken });
  }

  if (payload.email) {
    return AuthApi.server.login({
      socialType: SOCIAL_TYPE.KAKAO,
      email: payload.email,
      socialUniqueId: '',
      gender: null,
      age: null,
    });
  }

  throw new Error('Kakao login payload is invalid');
}

async function loginWithApple(payload: LoginPayload): Promise<TokenData> {
  if (!payload.idToken || !payload.nonce) {
    throw new Error('Apple login payload is invalid');
  }

  return AuthApi.server.appleLogin({
    idToken: payload.idToken,
    nonce: payload.nonce,
  });
}

async function loginWithPreview(): Promise<TokenData> {
  const email = process.env.PREVIEW_TEST_EMAIL;
  const password = process.env.PREVIEW_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      `Preview login credentials are not configured (hasEmail=${Boolean(email)}, hasPassword=${Boolean(password)})`,
    );
  }

  return AuthApi.server.basicLogin({ email, password });
}

export async function createLoginResponse(payload: LoginPayload) {
  let tokens: TokenData;

  switch (payload.provider) {
    case 'kakao-login':
      tokens = await loginWithKakao(payload);
      break;
    case 'apple-login':
      tokens = await loginWithApple(payload);
      break;
    case 'preview-login':
      tokens = await loginWithPreview();
      break;
    default:
      throw new Error('Unsupported auth provider');
  }

  const response = NextResponse.json(createSessionPayload(tokens));
  applyRefreshTokenCookie(response, tokens.refreshToken);
  applyAccessTokenCookie(response, tokens.accessToken);

  return response;
}

export async function createSessionResponse(refreshToken: string) {
  const tokens = await AuthApi.server.renewToken(refreshToken);
  const response = NextResponse.json(createSessionPayload(tokens));

  applyRefreshTokenCookie(response, tokens.refreshToken || refreshToken);
  applyAccessTokenCookie(response, tokens.accessToken);

  return response;
}

export function createCachedSessionResponse(accessToken: string) {
  const user = decodeJwt(accessToken) as UserData;

  return NextResponse.json({ accessToken, user });
}

export async function readRefreshTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

export async function readAccessTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
}

export function createLogoutResponse() {
  const response = NextResponse.json({ ok: true });
  applyRefreshTokenCookie(response, null);
  applyAccessTokenCookie(response, null);
  return response;
}
