// ============================================
// Auth API - Request/Response Types
// ============================================

// --------------- Enums ---------------

export const enum SOCIAL_TYPE {
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}

// --------------- Request Types ---------------

export interface LoginParams {
  email: string;
  socialUniqueId: string;
  gender: 'MALE' | 'FEMALE' | null;
  age: number | null;
  socialType: SOCIAL_TYPE;
}

export interface AppleLoginParams {
  idToken: string;
  nonce: string;
}

export interface KakaoLoginParams {
  accessToken: string;
}

export interface BasicLoginParams {
  email: string;
  password: string;
}

export interface BasicSignupParams {
  email: string;
  password: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | null;
}

export interface RestoreParams {
  email: string;
  password: string;
}

// --------------- Response Types ---------------

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export interface UserData {
  sub: string;
  roles?: 'ROLE_USER' | 'ROLE_ADMIN';
  profile: string | null;
  userId: number;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  tokens: TokenData;
  info: UserData;
}

export interface BasicSignupResponse {
  message: string;
  email: string;
  nickname: string;
  accessToken: string;
  refreshToken: string;
}
