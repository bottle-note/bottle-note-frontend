'use client';

import React from 'react';
import AlcoholItem from '@/components/feature/home/AlcoholItem';
import type { Alcohol } from '@/api/alcohol/types';

interface Props {
  items: Alcohol[];
}

export function HomeFeaturedItemList({ items }: Props) {
  return (
    <div className="whitespace-nowrap overflow-x-auto overflow-y-hidden flex space-x-2 scrollbar-hide">
      {items.map((item, index) => (
        <div
          key={item.alcoholId}
          className={`flex-shrink-0 flex-grow-0 rounded-lg ${
            index === items.length - 1 ? 'pr-[25px]' : ''
          }`}
        >
          <AlcoholItem data={item} />
        </div>
      ))}
    </div>
  );
}
