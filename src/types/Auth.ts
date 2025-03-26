export const enum SOCIAL_TYPE {
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}

export interface LoginReq {
  email: string;
  gender: 'MALE' | 'FEMALE' | null;
  age: number | null;
  socialType: SOCIAL_TYPE;
}

export interface UserData {
  sub: string;
  roles?: 'ROLE_USER' | 'ROLE_ADMIN';
  profile: string | null;
  userId: number;
  iat?: number;
  exp?: number;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export interface LoginReturn {
  tokens: TokenData;
  info: UserData;
}

export interface BasicSignupRes {
  message: string;
  email: string;
  nickname: string;
  accessToken: string;
  refreshToken: string;
}
