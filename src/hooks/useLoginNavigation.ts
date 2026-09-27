import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getReturnToUrl } from '@/utils/loginRedirect';
import { consumeLoginTrigger } from '@/utils/loginTrigger';

// 로그인 화면이 언마운트되어도 다음 화면의 렌더링까지 SDK 호출을 메모리에서 이어준다.
let pendingExternalLogin: { returnTo: string; start: () => void } | null = null;

// returnTo 화면의 렌더링이 끝나면 대기 중인 외부 인증을 시작하고, 로그인 유입 정보를 유지한다.
export const completeLoginPageReplacement = (): boolean => {
  if (!pendingExternalLogin) return false;
  if (window.location.pathname === ROUTES.LOGIN) return true;

  const pending = pendingExternalLogin;
  pendingExternalLogin = null;
  if (window.location.href !== pending.returnTo) return false;

  pending.start();
  return true;
};

// 호출 시점의 URL에서 로그인 쿼리를 읽고, 카카오 콜백에서는 state를 풀어 읽는다.
const getCurrentLoginParams = () => {
  const url = new URL(window.location.href);
  return url.pathname === '/oauth/kakao'
    ? new URLSearchParams(url.searchParams.get('state') ?? '')
    : url.searchParams;
};

// 로그인 복귀 주소의 조회·검증과 로그인 화면의 이동을 담당한다.
export const useLoginNavigation = () => {
  const router = useRouter();

  // 현재 returnTo를 검증하고, 유효하지 않으면 기본 복귀 주소를 반환한다.
  const getCurrentReturnTo = () =>
    getReturnToUrl(getCurrentLoginParams().get('returnTo'));

  // 웹·앱 로그인 실패 시 유입 정보를 정리하고 홈으로 이동한다.
  const redirectOnLoginError = () => {
    pendingExternalLogin = null;
    consumeLoginTrigger();
    router.replace(ROUTES.HOME);
  };

  // 로그인 기록을 실제 returnTo 화면으로 교체하고, 렌더링 완료 후 실행할 외부 인증을 등록한다.
  const replaceBeforeExternalLogin = (returnTo: string, start: () => void) => {
    pendingExternalLogin = {
      returnTo: new URL(returnTo, window.location.origin).href,
      start,
    };
    router.replace(returnTo);
  };

  // 로그인 유입 정보를 정리하고 이전 화면으로 돌아가며, 이전 화면이 없으면 홈으로 이동한다.
  const cancelLogin = () => {
    pendingExternalLogin = null;
    consumeLoginTrigger();
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(ROUTES.HOME);
    }
  };

  // 약관 필요 여부에 따라 복귀 주소를 보존한 약관 화면 또는 returnTo로 이동한다.
  const redirectAfterLogin = (
    agreementRequired: boolean,
    returnTo = getCurrentReturnTo(),
  ) => {
    if (agreementRequired) {
      const params = new URLSearchParams({ returnTo });
      router.replace(`${ROUTES.AGREEMENTS}?${params.toString()}`);
    } else {
      router.replace(returnTo);
    }
  };

  // 약관 동의 완료 후 쿼리에 보존된 returnTo로 이동한다.
  const completeAgreement = () => {
    redirectAfterLogin(false);
  };

  return {
    getCurrentReturnTo,
    redirectOnLoginError,
    replaceBeforeExternalLogin,
    redirectAfterLogin,
    cancelLogin,
    completeAgreement,
  };
};
