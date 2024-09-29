export interface LoginReq {
  email: string;
  gender: 'MALE' | 'FEMALE' | null;
  age: number | null;
  socialType: 'KAKAO' | 'NAVER' | 'GOOGLE' | 'APPLE' | string;
}

export interface UserData {
  sub: string;
  roles: 'ROLE_USER' | 'ROLE_ADMIN';
  profile: string;
  userId: number;
  iat: number;
  exp: number;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export interface LoginReturn {
  tokens: TokenData;
  info: UserData;
}
