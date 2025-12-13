'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { DeviceService } from '@/lib/DeviceService';
import { useLogin } from '@/hooks/useLogin';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/auth/useAuth';
import SocialLoginBtn from './_components/SocialLoginBtn';
import LogoWhite from 'public/bottle_note_logo_white.svg';

const RETURN_TO_KEY = 'login_return_to';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    handleSendDeviceInfo,
    handleInitKakaoSdkLogin,
    handleKakaoLogin,
    handleAppleLogin,
  } = useLogin();
  const { isLoggedIn } = useAuth();

  // returnTo 파라미터를 sessionStorage에 저장
  useEffect(() => {
    const returnTo = searchParams.get('returnTo');
    if (returnTo) {
      sessionStorage.setItem(RETURN_TO_KEY, returnTo);
    }
  }, [searchParams]);

  useEffect(() => {
    handleSendDeviceInfo();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const returnTo = sessionStorage.getItem(RETURN_TO_KEY);
      sessionStorage.removeItem(RETURN_TO_KEY);
      router.replace(returnTo || '/');
    }
  }, [isLoggedIn]);

  // 인앱 환경에서 초기화
  useEffect(() => {
    if (window.isInApp) {
      handleWebViewMessage('deviceToken');
      DeviceService.setIsInApp(window.isInApp);
    }
  }, []);

  useEffect(() => {
    handleInitKakaoSdkLogin();
  }, []);

  return (
    <>
      <main className="w-full h-[100vh] flex flex-col justify-end items-center bg-subCoral pb-5">
        <section className="w-full">
          <SubHeader bgColor="bg-subCoral">
            <SubHeader.Left
              onClick={() => {
                router.push(ROUTES.HOME);
              }}
            >
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
            <SocialLoginBtn type="KAKAO" onClick={handleKakaoLogin} />
            {DeviceService.platform === 'ios' && (
              <SocialLoginBtn type="APPLE" onClick={handleAppleLogin} />
            )}
          </article>
        </section>

        <footer className="w-full pt-2 flex flex-col gap-2 px-4">
          <div className="w-full h-[1px] bg-white" />
          <p className="text-12 text-white text-center">
            © Copyright 2024. Bottle Note. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
