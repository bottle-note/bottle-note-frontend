import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getReturnToUrl, isValidReturnUrl } from '@/utils/loginRedirect';
import { getLoginHistoryDirection } from '@/utils/loginHistory';
import { consumeLoginTrigger } from '@/utils/loginTrigger';

const LOGIN_HISTORY_STATE_KEY = '__bottleNoteLogin';

// 호출 시점의 URL에서 로그인 쿼리를 읽고, 카카오 콜백에서는 state를 풀어 읽는다.
const getCurrentLoginParams = () => {
  const url = new URL(window.location.href);
  return url.pathname === '/oauth/kakao'
    ? new URLSearchParams(url.searchParams.get('state') ?? '')
    : url.searchParams;
};

// 로그인 복귀 주소의 조회·검증과 로그인 화면의 히스토리·이동을 담당한다.
export const useLoginNavigation = () => {
  const router = useRouter();

  // 현재 returnTo를 검증하고, 유효하지 않으면 기본 복귀 주소를 반환한다.
  const getCurrentReturnTo = () =>
    getReturnToUrl(getCurrentLoginParams().get('returnTo'));

  // 사용처에서 지정한 유효한 실패 복귀 주소를 반환한다.
  const getCurrentErrorTo = () => {
    const errorTo = getCurrentLoginParams().get('errorTo');
    return errorTo && isValidReturnUrl(errorTo) ? errorTo : null;
  };

  // errorTo로 실패 복귀를 처리하며, 웹 콜백에서는 기본 오류 화면도 사용할 수 있다.
  const redirectOnLoginError = (
    errorTo = getCurrentErrorTo(),
    useErrorPage = false,
  ) => {
    if (errorTo && isValidReturnUrl(errorTo)) {
      consumeLoginTrigger();
      router.replace(errorTo);
      return true;
    }
    if (useErrorPage) {
      router.replace(ROUTES.ERROR);
      return true;
    }
    return false;
  };

  // 로그인 유입 정보를 정리하고 이전 화면으로 돌아가며, 이전 화면이 없으면 홈으로 이동한다.
  const cancelLogin = () => {
    consumeLoginTrigger();
    if (window.history.state?.[LOGIN_HISTORY_STATE_KEY]?.hasPreviousPage) {
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

  // 로그인 히스토리를 건너뛰거나 취소 정보를 기록하고, 인증된 진입은 준비 작업 후 복귀한다.
  const initializeLoginPage = async (
    isLoggedIn: boolean,
    beforeReturn: () => Promise<void>,
  ) => {
    const entry = window.history.state?.[LOGIN_HISTORY_STATE_KEY];
    if (isLoggedIn && entry) {
      const direction = getLoginHistoryDirection();
      if (direction === 'back') {
        if (entry.hasPreviousPage) router.back();
        else router.replace(ROUTES.HOME);
        return;
      }
      if (direction === 'forward') {
        window.history.forward();
        return;
      }
    }

    if (isLoggedIn) {
      const returnTo = getCurrentReturnTo();
      await beforeReturn();
      redirectAfterLogin(false, returnTo);
      return;
    }

    window.history.replaceState(
      {
        ...window.history.state,
        [LOGIN_HISTORY_STATE_KEY]: {
          hasPreviousPage: entry?.hasPreviousPage ?? window.history.length > 1,
        },
      },
      '',
    );
  };

  return {
    getCurrentReturnTo,
    getCurrentErrorTo,
    redirectOnLoginError,
    redirectAfterLogin,
    initializeLoginPage,
    cancelLogin,
    completeAgreement,
  };
};
