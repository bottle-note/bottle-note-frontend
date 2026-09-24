'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import Loading from '@/components/ui/Loading/Loading';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { DeviceService } from '@/lib/DeviceService';
import { useSocialLogin } from '@/hooks/useSocialLogin';
import { ROUTES } from '@/constants/routes';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { restoreAuthSession } from '@/lib/auth/session-store';
import useStatefulSearchParams from '@/hooks/useStatefulSearchParams';
import {
  clearReturnToUrl,
  getPendingReturnToUrl,
  setReturnToUrl,
  isValidReturnUrl,
} from '@/utils/loginRedirect';
import { getLoginHistoryDirection } from '@/utils/loginHistory';
import { consumeLoginTrigger } from '@/utils/loginTrigger';
import SocialLoginBtn from './_components/SocialLoginBtn';
import LogoWhite from 'public/bottle_note_logo_white.svg';

const LOGIN_HISTORY_STATE_KEY = '__bottleNoteLogin';

export default function Login() {
  const router = useRouter();
  const [returnToParam] = useStatefulSearchParams<string | null>('returnTo');
  const {
    startKakaoLogin,
    startAppleLogin,
    continueAuthenticatedSession,
    cancelMbtiLogin,
  } = useSocialLogin();
  const { isLoggedIn, isLoading } = useAuthSession();
  const hasCheckedInitialSession = useRef(false);

  const handleBack = () => {
    const entry = window.history.state?.[LOGIN_HISTORY_STATE_KEY];
    const returnTo = entry?.returnTo ?? getPendingReturnToUrl();
    if (cancelMbtiLogin(returnTo)) return;

    clearReturnToUrl();
    consumeLoginTrigger();
    // 쿼리 진입은 replace, 저장소를 사용하는 모달 진입은 push 방식이다.
    if (returnToParam === null && entry?.hasPreviousPage) {
      router.back();
    } else {
      router.replace(returnTo || ROUTES.HOME);
    }
  };

  useEffect(() => {
    if (isLoading || hasCheckedInitialSession.current) return;
    hasCheckedInitialSession.current = true;

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

    // 쿼리가 있으면 우선하며, 잘못된 쿼리로 과거 목적지가 재사용되지 않게 한다.
    const returnTo =
      returnToParam !== null
        ? isValidReturnUrl(returnToParam)
          ? returnToParam
          : null
        : entry?.returnTo ?? getPendingReturnToUrl();
    clearReturnToUrl();
    if (returnTo) setReturnToUrl(returnTo);

    if (isLoggedIn) {
      void continueAuthenticatedSession();
      return;
    }

    window.history.replaceState(
      {
        ...window.history.state,
        [LOGIN_HISTORY_STATE_KEY]: {
          returnTo,
          hasPreviousPage: entry?.hasPreviousPage ?? window.history.length > 1,
        },
      },
      '',
    );
  }, [
    continueAuthenticatedSession,
    isLoggedIn,
    isLoading,
    returnToParam,
    router,
  ]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;

      // OAuth 이전 문서가 bfcache로 복원되면 로그인 전 메모리 상태도 복원된다.
      hasCheckedInitialSession.current = false;
      void restoreAuthSession();
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // 인앱 환경에서 초기화
  useEffect(() => {
    if (window.isInApp) {
      handleWebViewMessage('deviceToken');
      DeviceService.setIsInApp(window.isInApp);
    }
  }, []);

  if (isLoading || isLoggedIn) return <Loading />;

  return (
    <>
      <main className="w-full flex flex-1 flex-col justify-end items-center bg-subCoral pb-5">
        <section className="w-full">
          <SubHeader bgColor="bg-subCoral">
            <SubHeader.Left onClick={handleBack}>
              <Image
                src="/icon/arrow-left-white.svg"
                alt="arrowIcon"
                width={23}
                height={23}
              />
            </SubHeader.Left>
            <SubHeader.Center textColor="text-white">로그인</SubHeader.Center>
          </SubHeader>
        </section>

        <section className="shrink-0 flex-1 flex">
          <div className="flex flex-col items-center justify-center w-[92px]">
            <Image src={LogoWhite} alt="bottle-note-logo" />
          </div>
        </section>

        <section className="flex flex-col gap-5 pb-5 w-full px-5">
          <article className="flex gap-2 items-center py-2  justify-center">
            <span className="text-sm text-white shrink-0 text-center whitespace-pre">
              {`나의 입맛에 딱 맞는 한 병을\n찾아가는 여정 노트`}
            </span>
          </article>

          <article className="flex flex-col gap-2 px-4">
            <SocialLoginBtn type="KAKAO" onClick={startKakaoLogin} />
            {DeviceService.platform === 'ios' && (
              <SocialLoginBtn type="APPLE" onClick={startAppleLogin} />
            )}
          </article>
        </section>

        <footer className="w-full pt-2 flex flex-col gap-2 px-5 pb-safe">
          <div className="w-full h-[1px] bg-white" />
          <p className="text-12 text-white text-center">
            © Copyright 2026. Bottle Note. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
