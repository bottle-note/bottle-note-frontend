import { redirect } from 'next/navigation';
import {
  isAccessTokenValid,
  readAccessTokenCookie,
  readRefreshTokenCookie,
} from '@/lib/auth/server';
import { getReturnToUrl } from '@/utils/loginRedirect';
import LoginScreen from './_components/LoginScreen';

interface Props {
  searchParams: { returnTo?: string | string[] };
}

// 로그인 페이지 진입 시 기존 세션만 검사하고, 로그인 성공 이후의 이동에는 관여하지 않는다.
export default async function LoginPage({ searchParams }: Props) {
  const returnTo = getReturnToUrl(
    typeof searchParams.returnTo === 'string' ? searchParams.returnTo : null,
  );
  const accessToken = await readAccessTokenCookie();

  if (accessToken && isAccessTokenValid(accessToken)) {
    redirect(returnTo);
  }

  if (await readRefreshTokenCookie()) {
    // 만료된 세션의 갱신 쿠키는 Route Handler에서 브라우저 응답에 반영한다.
    redirect(`/api/auth/login?${new URLSearchParams({ returnTo })}`);
  }

  return <LoginScreen />;
}
