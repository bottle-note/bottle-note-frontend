'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export function HomeFeaturedLoginRequired() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full -ml-[25px]">
      <div className="flex flex-col items-center justify-center flex-grow space-y-[14px]">
        <Image
          src="/icon/logo-subcoral.svg"
          alt="logo"
          width={28}
          height={48}
          style={{ width: 28, height: 48 }}
          priority
        />
        <p className="text-mainGray text-16">
          로그인 후 확인 가능한 서비스 입니다.
        </p>
        <button
          className="w-[237px] py-[8.5px] text-16 font-bold text-subCoral border border-subCoral rounded-[18px]"
          onClick={() => router.push(ROUTES.LOGIN)}
        >
          로그인 하러가기
        </button>
      </div>
    </div>
  );
}
