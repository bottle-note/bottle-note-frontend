'use client';

import React from 'react';
import { useHomeFeaturedQuery } from '@/queries/useHomeFeaturedQuery';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import type { HomeFeaturedType } from '@/types/HomeFeatured';
import type { HomeSection } from '@/utils/analytics/types';
import { HOME_FEATURED_CONFIG } from '@/constants/home';

import { HomeRankList } from './_components/HomeRankList';
import { HomeFeaturedEmptyState } from './_components/HomeFeaturedEmptyState';
import { HomeFeaturedErrorState } from './_components/HomeFeaturedErrorState';
import { HomeFeaturedLoginRequired } from './_components/HomeFeaturedLoginRequired';

const SECTION_BY_TYPE: Partial<Record<HomeFeaturedType, HomeSection>> = {
  'view-week': 'weekly_top',
  recent: 'recent_viewed',
};

interface Props {
  type?: HomeFeaturedType;
}

function HomeFeaturedList({ type = 'week' }: Props) {
  const { isLoggedIn, isLoading: isAuthLoading } = useAuthSession();
  const { requiresAuth } = HOME_FEATURED_CONFIG[type];

  // 로그인이 필요한 타입인데 로그인하지 않은 경우 쿼리 비활성화
  const shouldFetchData = !requiresAuth || isLoggedIn;

  const {
    data: featuredList,
    isLoading,
    isError,
    refetch,
  } = useHomeFeaturedQuery({
    type,
    enabled: shouldFetchData,
  });

  if (requiresAuth && !isLoggedIn) {
    return <HomeFeaturedLoginRequired isAuthLoading={isAuthLoading} />;
  }

  if (isLoading) {
    return (
      <div className="px-20" aria-busy="true">
        <SkeletonBase count={5} height={88} />
      </div>
    );
  }

  if (isError) {
    return <HomeFeaturedErrorState onRetry={() => refetch()} />;
  }

  if (!featuredList || featuredList.length === 0) {
    return <HomeFeaturedEmptyState type={type} />;
  }

  return (
    <HomeRankList
      items={featuredList}
      section={SECTION_BY_TYPE[type] ?? 'weekly_top'}
      ranked={type !== 'recent'}
    />
  );
}

export default HomeFeaturedList;
