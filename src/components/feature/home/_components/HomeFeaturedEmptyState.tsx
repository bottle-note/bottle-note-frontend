'use client';

import React from 'react';
import Image from 'next/image';
import type { HomeFeaturedType } from '@/types/HomeFeatured';
import { HOME_FEATURED_CONFIG } from '@/constants/home';

interface Props {
  type: HomeFeaturedType;
}

export function HomeFeaturedEmptyState({ type }: Props) {
  const { emptyText } = HOME_FEATURED_CONFIG[type];

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
      <p className="text-mainGray text-15 mt-5">{emptyText}</p>
    </div>
  );
}
