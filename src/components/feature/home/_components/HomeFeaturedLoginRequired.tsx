'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button/Button';
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
        <p className="text-16 text-fg-neutral-muted">
          로그인 후 확인 가능한 서비스 입니다.
        </p>
        <Button
          size="md"
          variant="secondary"
          className="w-[237px]"
          onClick={() => router.push(ROUTES.LOGIN)}
        >
          로그인 하러가기
        </Button>
      </div>
    </div>
  );
}
