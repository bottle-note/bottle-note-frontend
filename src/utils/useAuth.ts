import { Storage } from '@/lib/Storage';
import { TokenData, UserData } from '@/types/Auth';

interface UseAuth {
  getIsLogin: () => boolean;
  getUserData: () => UserData | null;
  getToken: () => TokenData | null;
  setUserData: (arg: UserData) => void;
  setToken: (arg: TokenData) => void;
  login: (userData: UserData, token: TokenData) => void;
  logout: () => void;
}

export function useAuth(): UseAuth {
  const getIsLogin = () => {
    return Boolean(Storage.getItem('userData'));
  };

  const getUserData = () => {
    if (getIsLogin()) return Storage.getItem<UserData>('userData');

    return null;
  };

  const getToken = () => {
    if (getIsLogin()) return Storage.getItem<TokenData>('userToken');

    return null;
  };

  const setUserData = (userData: UserData) => {
    Storage.setItem('userData', userData);
  };

  const setToken = (token: TokenData) => {
    Storage.setItem('userToken', token);
  };

  const login = (userData: UserData, token: TokenData) => {
    setUserData(userData);
    setToken(token);
  };

  const logout = () => {
    Storage.removeItem('userData');
    Storage.removeItem('userToken');
  };

  return {
    getIsLogin,
    getUserData,
    getToken,
    setUserData,
    setToken,
    login,
    logout,
  };
}
