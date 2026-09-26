'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import Loading from '@/components/ui/Loading/Loading';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { DeviceService } from '@/lib/DeviceService';
import { useSocialLogin } from '@/hooks/useSocialLogin';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { restoreAuthSession } from '@/lib/auth/session-store';
import SocialLoginBtn from './_components/SocialLoginBtn';
import LogoWhite from 'public/bottle_note_logo_white.svg';

export default function Login() {
  const { startKakaoLogin, startAppleLogin, initializeLoginPage, cancelLogin } =
    useSocialLogin();
  const { isLoggedIn, isLoading } = useAuthSession();
  const hasCheckedInitialSession = useRef(false);

  useEffect(() => {
    if (isLoading || hasCheckedInitialSession.current) return;
    hasCheckedInitialSession.current = true;
    void initializeLoginPage(isLoggedIn);
  }, [initializeLoginPage, isLoggedIn, isLoading]);

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
            <SubHeader.Left onClick={cancelLogin}>
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
