import { Storage } from '@/lib/Storage';
import { TokenData, UserData } from '@/types/Auth';

export class AuthService {
  static isLogin: boolean = AuthService.getIsLogin();

  static userData: UserData | null = AuthService.getUserData();

  private static getIsLogin(): boolean {
    return Boolean(Storage.getItem('userData'));
  }

  private static getUserData(): UserData | null {
    if (AuthService.getIsLogin()) {
      return Storage.getItem<UserData>('userData');
    }
    return null;
  }

  static getToken(): TokenData | null {
    if (AuthService.getIsLogin()) {
      return Storage.getItem<TokenData>('userToken');
    }
    return null;
  }

  static setUserData(userData: UserData): void {
    Storage.setItem('userData', userData);
    AuthService.userData = userData;
    AuthService.isLogin = true;
  }

  static setToken(token: TokenData): void {
    Storage.setItem('userToken', token);
  }

  static login(userData: UserData, token: TokenData): void {
    AuthService.setUserData(userData);
    AuthService.setToken(token);
  }

  static logout(): void {
    Storage.removeItem('userData');
    Storage.removeItem('userToken');
    AuthService.userData = null;
    AuthService.isLogin = false;
  }
}
