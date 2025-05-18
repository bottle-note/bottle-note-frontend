'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import NavLayout from '@/app/(primary)/_components/NavLayout';

export default function NotFound() {
  const router = useRouter();
  return (
    <NavLayout>
      <SubHeader bgColor="bg-bgGray">
        <SubHeader.Left
          onClick={() => {
            router.back();
          }}
        >
          <Image
            src="/icon/arrow-left-subcoral.svg"
            alt="arrowIcon"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center textColor="text-subCoral">ERROR</SubHeader.Center>
      </SubHeader>
      <div className="h-screen flex flex-col justify-center items-center gap-5">
        <Image
          src="/icon/logo-subcoral.svg"
          alt="bottle_logo"
          width={73}
          height={125}
          style={{ width: 73, height: 125 }}
          priority
        />
        <div className="text-center space-y-2">
          <p className="text-mainGray text-20">어이쿠!</p>
          <p className="text-mainGray text-15">
            에러가 발생했어요.
            <br />
            다시 시도해주세요.
          </p>
        </div>
      </div>
    </NavLayout>
  );
}
