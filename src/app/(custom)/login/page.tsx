'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { AuthService } from '@/lib/AuthService';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { UserApi } from '@/app/api/UserApi';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { DeviceService } from '@/lib/DeviceService';
import { AuthApi } from '@/app/api/AuthApi';
import { UserData } from '@/types/Auth';
import Modal from '@/components/Modal';
import useModalStore from '@/store/modalStore';
import SocialLoginBtn from './_components/SocialLoginBtn';
import LogoWhite from 'public/bottle_note_logo_white.svg';

const jwt = require('jsonwebtoken');

type FormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isLogin, login } = AuthService;
  const { isInApp, setIsInApp } = DeviceService;
  const { handleModalState, handleCloseModal } = useModalStore();

  const {
    register,
    handleSubmit,
    formState: { errors: loginErrors },
  } = useForm<FormValues>();

  const handleLogin = (data: FormValues) => {
    try {
      // 로그인 시도
      const result = AuthApi.basicLogin(data);

      // TODO: 로그인 완료 후 데이터 저장
      login(
        {
          profile: '',
          sub: '',
          userId: -1,
        },
        {
          accessToken: '',
          refreshToken: '',
        },
      );

      router.push('/');
    } catch (e) {
      // 로그인 실패

      handleModalState({
        isShowModal: true,
        mainText: '로그인에 실패하였습니다.',
        handleConfirm: () => {
          handleCloseModal();
        },
      });
    }
  };

  const handleSingup = () => {};

  useEffect(() => {
    if (session) {
      if (session.user) {
        const { userId, email, profile, accessToken, refreshToken } =
          session.user;

        AuthService.login(
          {
            userId,
            sub: email,
            profile,
          },
          {
            accessToken,
            refreshToken,
          },
        );

        router.replace('/');
      }
    }
  }, [session]);

  // NOTE: 인앱 상태일 때 웹뷰에 device token 발급 요청
  useEffect(() => {
    if (window.isInApp) {
      handleWebViewMessage('deviceToken');
      setIsInApp(window.isInApp);
    }
  }, []);

  // NOTE: 인앱 상태일 때, 로그인이 완료된 상태일 때 device 정보를 서버로 전달 및 로그인 처리
  useEffect(() => {
    (async () => {
      try {
        if (isInApp && isLogin) {
          const result = await UserApi.sendDeviceInfo(
            DeviceService.deviceToken || '',
            DeviceService.platform || '',
          );

          window.sendLogToFlutter(
            `${result.data.message} / ${result.data.deviceToken} / ${result.data.platform}`,
          );
          router.replace('/');
          return;
        }

        if (!isInApp && isLogin) {
          router.replace('/');
        }
      } catch (e) {
        window.sendLogToFlutter((e as Error).message);
      }
    })();
  }, [isLogin]);

  // ----- kakao sdk login
  useEffect(() => {
    const kakaoSDK = document.createElement('script');
    kakaoSDK.async = false;
    kakaoSDK.src = `https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js`;
    kakaoSDK.integrity = `sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4`;
    kakaoSDK.crossOrigin = `anonymous`;
    document.head.appendChild(kakaoSDK);

    const onLoadKakaoAPI = () => {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID);

        console.log('after Init: ', window.Kakao.isInitialized());
      }
    };

    kakaoSDK.addEventListener('load', onLoadKakaoAPI);
  }, []);

  const redirectUri = `${process.env.NEXT_PUBLIC_CLIENT_URL}/oauth/kakao`;
  const kakaoLoginHandler = () => {
    window.Kakao.Auth.authorize({
      redirectUri,
    });
  };

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
          <div className="flex flex-col items-center justify-center">
            <Image src={LogoWhite} alt="bottle-note-logo" />
          </div>
        </section>

        <section className="flex flex-col gap-5 pb-5 w-full px-5">
          <p className="text-13 text-white font-bold whitespace-pre text-center">{`나의 입맛에 맞는 딱 한 병을\n찾아가는 여정 노트`}</p>

          <form
            onSubmit={handleSubmit(handleLogin)}
            className="flex flex-col gap-2"
          >
            <input
              type="email"
              placeholder="email"
              {...register('email', { required: '이메일을 입력하세요' })}
            />
            {loginErrors.email && (
              <span className="text-xs text-white">
                {loginErrors.email.message}
              </span>
            )}
            <input
              type="password"
              placeholder="password"
              {...register('password', {
                required: '비밀번호를 입력하세요',
                minLength: { value: 8, message: '8자 이상 입력하세요' },
                maxLength: { value: 35, message: '35자 이하로 입력하세요' },
              })}
            />
            {loginErrors.password && (
              <span className="text-xs text-white">
                {loginErrors.password.message}
              </span>
            )}
            <button className="bg-white text-subCoral rounded-md py-2.5">
              로그인
            </button>
          </form>

          <article className="flex flex-col gap-2">
            <button
              className="bg-white text-subCoral rounded-md py-2.5"
              onClick={handleSingup}
            >
              회원가입
            </button>
            <SocialLoginBtn type="KAKAO" onClick={kakaoLoginHandler} />
            <SocialLoginBtn type="APPLE" onClick={() => signIn('apple')} />
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
