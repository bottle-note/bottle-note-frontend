'use client';

import React from 'react';
import { HOME_FEATURED_CONTENT, HomeFeaturedType } from '@/types/HomeFeatured';

interface Props {
  type: HomeFeaturedType;
  nickname?: string;
}

export function HomeFeaturedDescription({ type, nickname }: Props) {
  const content = HOME_FEATURED_CONTENT[type];
  const line1 = type === 'recent' ? `${nickname ?? ''} 님이` : content.line1;

  return (
    <>
      <p className="pb-[10px] text-13 font-extrabold text-mainCoral">
        {content.title}
      </p>
      <div className="text-20 font-bold space-y-[2px] pb-5">
        <p>{line1}</p>
        <p>{content.line2}</p>
      </div>
    </>
  );
}
