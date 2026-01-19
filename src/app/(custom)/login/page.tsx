'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { DeviceService } from '@/lib/DeviceService';
import { useLogin } from '@/hooks/useLogin';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/auth/useAuth';
import useStatefulSearchParams from '@/hooks/useStatefulSearchParams';
import {
  setReturnToUrl,
  getReturnToUrl,
  isValidReturnUrl,
} from '@/utils/loginRedirect';
import SocialLoginBtn from './_components/SocialLoginBtn';
import LogoWhite from 'public/bottle_note_logo_white.svg';

export default function Login() {
  const router = useRouter();
  const [returnToParam] = useStatefulSearchParams<string | null>('returnTo');
  const {
    handleSendDeviceInfo,
    handleInitKakaoSdkLogin,
    handleKakaoLogin,
    handleAppleLogin,
  } = useLogin();
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (returnToParam && isValidReturnUrl(returnToParam)) {
      setReturnToUrl(returnToParam);
    }
  }, [returnToParam]);

  // 이미 로그인된 상태면 리다이렉트 (session 로딩 완료 후에만 실행)
  useEffect(() => {
    if (isLoading) return;

    if (isLoggedIn) {
      // 디바이스 정보 전송 후 리다이렉트
      handleSendDeviceInfo();
      router.replace(getReturnToUrl());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleSendDeviceInfo는 isLoggedIn에 의존하므로 별도 추가 불필요
  }, [isLoggedIn, isLoading, router]);

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
      <main className="w-full flex flex-1 flex-col justify-end items-center bg-subCoral pb-5">
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
            © Copyright 2026. Bottle Note. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
