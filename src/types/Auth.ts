export interface LoginReq {
  email: string;
  gender: 'MALE' | 'FEMALE' | null;
  age: number | null;
  socialType: 'KAKAO' | 'NAVER' | 'GOOGLE' | 'APPLE' | string;
}
