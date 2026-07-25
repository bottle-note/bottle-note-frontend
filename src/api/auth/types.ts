// ============================================
// Auth API - Request/Response Types
// ============================================

// --------------- Enums ---------------

export const enum SOCIAL_TYPE {
  KAKAO = 'KAKAO',
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
