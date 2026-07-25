export interface UserData {
  sub: string;
  roles?: 'ROLE_USER' | 'ROLE_ADMIN';
  profile: string | null;
  userId: number;
  iat?: number;
  exp?: number;
}
