'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { AuthService } from '@/lib/AuthService';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { DeviceService } from '@/lib/DeviceService';
import Modal from '@/components/Modal';
import { useLogin } from '@/hooks/useLogin';
import SocialLoginBtn from './_components/SocialLoginBtn';
import LogoWhite from 'public/bottle_note_logo_white.svg';

type FormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    handleBasicLogin,
    handleRedirectWithSession,
    handleSendDeviceInfo,
    handleInitKakaoSdkLogin,
    handleKakaoLogin,
    handleAppleLogin,
  } = useLogin();
  const { isLogin } = AuthService;
  const { register, handleSubmit } = useForm<FormValues>();

  const handleSignup = () => {
    router.push('/signup');
  };

  useEffect(() => {
    handleRedirectWithSession();
  }, [session]);

  useEffect(() => {
    handleSendDeviceInfo();
  }, [isLogin]);

  // 인앱 환경에서 초기화
  useEffect(() => {
    if (window.isInApp) {
      handleWebViewMessage('deviceToken');
      DeviceService.setIsInApp(window.isInApp);
    }
  }, []);

  useEffect(() => {
    console.log('DeviceService.platform', DeviceService.platform);
  }, [DeviceService.platform]);

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
                router.push('/');
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
          <form
            onSubmit={handleSubmit(handleBasicLogin)}
            className="flex flex-col gap-2"
          >
            <input
              className="border p-2 rounded-md"
              type="email"
              placeholder="이메일 입력"
              {...register('email', { required: '이메일을 입력하세요' })}
            />

            <input
              className="border p-2 rounded-md"
              type="password"
              placeholder="비밀번호 8 ~ 35자 입력"
              {...register('password', {
                required: '비밀번호를 입력하세요',
                minLength: { value: 8, message: '8자 이상 입력하세요' },
                maxLength: { value: 35, message: '35자 이하로 입력하세요' },
              })}
            />

            <button className="bg-subCoral text-white border border-white rounded-md py-2.5">
              로그인 하기
            </button>
            <button onClick={handleSignup}>
              <span className="text-xs text-white">
                보틀노트 회원이 아니신가요?
              </span>
            </button>
          </form>

          <article className="flex gap-2 items-center py-2">
            <div className="w-full h-[1px] bg-white" />
            <span className="text-xs text-white shrink-0">또는</span>
            <div className="w-full h-[1px] bg-white" />
          </article>

          <article className="flex flex-col gap-2">
            <SocialLoginBtn type="KAKAO" onClick={handleKakaoLogin} />
            {DeviceService.platform === 'ios' && (
              <SocialLoginBtn type="APPLE" onClick={handleAppleLogin} />
            )}
          </article>
        </section>

        <footer className="border-t border-white w-full pt-2">
          <p className="text-xxs text-white text-center">
            © Copyright 2024. Bottle Note. All rights reserved.
          </p>
        </footer>
      </main>

      <Modal />
    </>
  );
}
