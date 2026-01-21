'use client';

import React from 'react';
import type { HomeFeaturedType } from '@/types/HomeFeatured';
import { HOME_FEATURED_CONFIG } from '@/constants/home';

interface Props {
  type: HomeFeaturedType;
  nickname?: string;
}

export function HomeFeaturedDescription({ type, nickname }: Props) {
  const config = HOME_FEATURED_CONFIG[type];
  const line1 = config.titleText[0].replace('{nickname}', nickname ?? '');

  return (
    <>
      <p className="pb-[10px] text-13 font-extrabold text-mainCoral">
        {config.titleLabel}
      </p>
      <div className="text-20 font-bold space-y-[2px] pb-5">
        <p>{line1}</p>
        <p>{config.titleText[1]}</p>
      </div>
    </>
  );
}
