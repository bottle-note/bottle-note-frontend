'use client';

import React from 'react';
import Image from 'next/image';
import type { HomeFeaturedType } from '@/types/HomeFeatured';

interface Props {
  type: HomeFeaturedType;
}

export function HomeFeaturedEmptyState({ type }: Props) {
  const text =
    type === 'recent' ? '최근에 본 위스키가 없어요.' : '데이터 준비 중 입니다.';

  return (
    <div className="h-[225px] flex flex-col items-center justify-center">
      <Image
        src="/icon/logo-subcoral.svg"
        alt="logo"
        width={30}
        height={30}
        style={{ width: 30, height: 30 }}
        priority
      />
      <p className="text-mainGray text-15 mt-5">{text}</p>
    </div>
  );
}
