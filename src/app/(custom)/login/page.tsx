'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { AuthService } from '@/lib/AuthService';
import SocialLoginBtn from './_components/SocialLoginBtn';
import Logo from 'public/icon/logo-white.svg';
import LogoText from 'public/icon/logo-text-white.svg';

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
      <section className="shrink-0 flex-1 flex">
        <div className="flex flex-col items-center justify-center">
          <Image src={Logo} alt="bottle-note-logo" />
          <Image src={LogoText} alt="bottle-note-logo" />
        </div>
      </section>

      <section className="flex flex-col gap-5 pb-5">
        <p className="text-13 text-subCoral font-bold whitespace-pre text-center">{`나의 입맛에 맞는 딱 한 병을\n찾아가는 여정 노트`}</p>

        <article className="flex flex-col gap-2">
          <SocialLoginBtn type="KAKAO" onClick={kakaoLoginHandler} />
          <SocialLoginBtn type="APPLE" onClick={() => signIn('apple')} />
        </article>
      </section>

      <footer className="border-t border-mainCoral w-full">
        <p className="text-xxs text-mainCoral text-center">
          © Copyright 2024. Bottle Note. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
