'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import Loading from '@/components/ui/Loading/Loading';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { DeviceService } from '@/lib/DeviceService';
import { useSocialLogin } from '@/hooks/useSocialLogin';
import { ROUTES } from '@/constants/routes';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useSessionRestoreSubscription } from '@/lib/auth/AuthProvider';
import { ClientSession, restoreAuthSession } from '@/lib/auth/session-store';
import {
  clearReturnToUrl,
  setReturnToUrl,
  getReturnToFromSearchParams,
} from '@/utils/loginRedirect';
import { consumeLoginTrigger } from '@/utils/loginTrigger';
import SocialLoginBtn from './_components/SocialLoginBtn';
import LogoWhite from 'public/bottle_note_logo_white.svg';

export default function Login() {
  const router = useRouter();
  const returnTo = getReturnToFromSearchParams(useSearchParams());
  const { startKakaoLogin, startAppleLogin, continueAuthenticatedSession } =
    useSocialLogin();
  const { isLoggedIn, isLoading } = useAuthSession();
  const subscribeToSessionRestore = useSessionRestoreSubscription();

  const handleBack = () => {
    clearReturnToUrl();
    consumeLoginTrigger();
    router.replace(returnTo);
  };

  // 비로그인 상태의 returnTo를 외부 인증 복귀용 sessionStorage에 저장한다.
  useEffect(() => {
    if (isLoading || isLoggedIn) return;
    setReturnToUrl(returnTo);
  }, [isLoggedIn, isLoading, returnTo]);

  // 최초 진입·세션 복원 후 인증된 사용자를 returnTo로 이동시킨다.
  useEffect(() => {
    let cancelled = false;
    const handleSessionRestored = (session: ClientSession | null) => {
      if (cancelled || !session || window.location.pathname !== ROUTES.LOGIN) {
        return;
      }

      void continueAuthenticatedSession(returnTo);
    };

    const unsubscribe = subscribeToSessionRestore(handleSessionRestored);
    void restoreAuthSession().then(handleSessionRestored);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [continueAuthenticatedSession, returnTo, subscribeToSessionRestore]);

  // 앱에서 디바이스 토큰을 요청하고 WebView 환경을 설정한다.
  useEffect(() => {
    if (window.isInApp) {
      handleWebViewMessage('deviceToken');
      DeviceService.setIsInApp(window.isInApp);
    }
  }, []);

  if (isLoading || isLoggedIn) return <Loading />;

  return (
    <>
      <main className="w-full flex flex-1 flex-col justify-end items-center bg-subCoral pb-20">
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
          <div className="flex flex-col items-center justify-center w-92">
            <Image src={LogoWhite} alt="bottle-note-logo" />
          </div>
        </section>

        <section className="flex flex-col gap-20 pb-20 w-full px-20">
          <article className="flex gap-8 items-center py-8  justify-center">
            <span className="text-sm text-white shrink-0 text-center whitespace-pre">
              {`나의 입맛에 딱 맞는 한 병을\n찾아가는 여정 노트`}
            </span>
          </article>

          <article className="flex flex-col gap-8 px-16">
            <SocialLoginBtn type="KAKAO" onClick={startKakaoLogin} />
            {DeviceService.platform === 'ios' && (
              <SocialLoginBtn type="APPLE" onClick={startAppleLogin} />
            )}
          </article>
        </section>

        <footer className="w-full pt-8 flex flex-col gap-8 px-20 pb-safe">
          <div className="w-full h-1 bg-white" />
          <p className="text-12 text-white text-center">
            © Copyright 2026. Bottle Note. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
