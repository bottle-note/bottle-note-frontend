// ============================================
// Auth API - Request/Response Types
// ============================================

// --------------- Request Types ---------------

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

export interface LoginTokenData extends TokenData {
  agreementRequired: boolean;
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
