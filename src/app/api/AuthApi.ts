import { LoginReq } from '@/types/Auth';

export const AuthApi = {
  async login(body: LoginReq): Promise<string> {
    const response = await fetch(`${process.env.SERVER_URL}/oauth/login`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { data } = await response.json();
    return data.accessToken;
  },
};
