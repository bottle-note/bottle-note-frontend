'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { AuthService } from '@/lib/AuthService';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import SocialLoginBtn from './_components/SocialLoginBtn';
import LogoWhite from 'public/bottle_note_logo_white.svg';

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isLogin } = AuthService;

  useEffect(() => {
    if (isLogin) {
      router.replace('/');
    }
  }, []);

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
    <main className="w-full h-[100vh] flex flex-col justify-end items-center bg-subCoral p-5">
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

      <section className="flex flex-col gap-5 pb-5 w-full">
        <p className="text-13 text-white font-bold whitespace-pre text-center">{`나의 입맛에 맞는 딱 한 병을\n찾아가는 여정 노트`}</p>

        <article className="flex flex-col gap-2">
          <button
            className="bg-white text-subCoral rounded-md py-2.5"
            onClick={() => alert('준비중입니당!')}
          >
            이메일 로그인
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
  );
}
