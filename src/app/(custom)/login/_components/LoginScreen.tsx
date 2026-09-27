'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import Loading from '@/components/ui/Loading/Loading';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { DeviceService } from '@/lib/DeviceService';
import { useSocialLogin } from '@/hooks/useSocialLogin';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import SocialLoginBtn from './SocialLoginBtn';
import LogoWhite from 'public/bottle_note_logo_white.svg';

// 로그인 화면은 입력을 받고, 로그인 성공 이후 이동은 소셜 로그인 처리에 맡긴다.
export default function LoginScreen() {
  const { startKakaoLogin, startAppleLogin, cancelLogin } = useSocialLogin();
  const { isLoggedIn, isLoading } = useAuthSession();
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
      <main className="w-full flex flex-1 flex-col justify-end items-center bg-subCoral pb-20">
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
