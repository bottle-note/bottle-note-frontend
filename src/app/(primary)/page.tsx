'use client';

import React, { useEffect, useState } from 'react';
import CategoryTitle from '@/components/CategoryTitle';
import HorizontalScroll from '@/components/HorizontalScroll';
import Header from '@/app/(primary)/_components/Header';
import { Alcohol } from '@/types/Alcohol';
import CategoryList from './_components/CategoryList';

export default function Home() {
  const [weeklyData, setWeeklyData] = useState<[] | Alcohol[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/alcohols?popular');
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await response.json();
        setWeeklyData(data);
      } catch (error) {
        console.error('Fetching error:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-1 relative">
      <Header />
      <section className="px-5 pb-20">
        <article className="py-2 pt-5 space-y-3">
          <CategoryTitle subTitle="위클리 HOT 5" />
          {weeklyData.length !== 0 && <HorizontalScroll data={weeklyData} />}
          {/* 없을 경우의 화면을 넣어줘야하나? */}
        </article>
        <article className="py-2 pt-5 space-y-3">
          <CategoryTitle subTitle="카테고리" />
          <CategoryList />
        </article>
      </section>
    </div>
  );
}
