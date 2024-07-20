'use client';

import Image from 'next/image';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SocialLoginBtn from './_components/SocialLoginBtn';
import LoginOptionDropdown from './_components/LoginOptionDropdown';

export default function Login() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOptionsShow, setIsOptionsShow] = useState(false);

  useEffect(() => {
    if (session?.user) {
      router.replace('/');
    }
  }, [session]);

  return (
    <main className="w-full h-[100vh] flex flex-col justify-end items-center bg-bgGray p-5">
      <section className="shrink-0 flex-1 flex">
        <Image
          src="bottle_note_logo.svg"
          width={140}
          height={200}
          alt="bottle-note-logo"
        />
      </section>

      <section className="flex flex-col gap-5 pb-5">
        <p className="text-13 text-subCoral font-bold whitespace-pre text-center">{`나의 입맛에 맞는 딱 한 병을\n찾아가는 여정 노트`}</p>

        <article className="flex flex-col gap-2">
          <SocialLoginBtn type="KAKAO" onClick={() => signIn('kakao')} />
          <SocialLoginBtn type="APPLE" onClick={() => alert('준비중입니다.')} />
        </article>

        <button
          onClick={() => {
            setIsOptionsShow(true);
          }}
        >
          <p className="text-xs underline text-mainGray text-center">
            다른 소셜 계정으로 <span className="font-bold">로그인</span>하기
          </p>
        </button>
      </section>

      <footer className="border-t border-mainCoral w-full">
        <p className="text-xxs text-mainCoral text-center">
          © Copyright 2024. Bottle Note. All rights reserved.
        </p>
      </footer>

      {isOptionsShow && (
        <LoginOptionDropdown handleClose={() => setIsOptionsShow(false)} />
      )}
    </main>
  );
}
