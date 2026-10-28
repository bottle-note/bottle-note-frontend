'use client';

import React from 'react';
import { useHomeFeaturedQuery } from '@/queries/useHomeFeaturedQuery';
import { useCurrentUserQuery } from '@/queries/useCurrentUserQuery';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import type { HomeFeaturedType } from '@/types/HomeFeatured';
import type { HomeSection } from '@/utils/analytics/types';
import { HOME_FEATURED_CONFIG } from '@/constants/home';

import HomeSectionHeader from './HomeSectionHeader';
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
  const { requiresAuth, titleLabel, titleText } = HOME_FEATURED_CONFIG[type];

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

  // 로그인 필요 타입일 때만 유저 정보 조회
  const { data: currentUser } = useCurrentUserQuery({
    enabled: requiresAuth && isLoggedIn && !isLoading,
  });

  if (requiresAuth && !isLoggedIn) {
    return <HomeFeaturedLoginRequired isAuthLoading={isAuthLoading} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-14 px-20" aria-busy="true">
        <SkeletonBase height={17} width={120} />
        <SkeletonBase count={2} height={24} width={270} />
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

  const title = [
    titleText[0].replace('{nickname}', currentUser?.nickname ?? ''),
    titleText[1],
  ].join('\n');

  return (
    <div className="space-y-8">
      <HomeSectionHeader label={titleLabel} title={title} />
      <HomeRankList
        items={featuredList}
        section={SECTION_BY_TYPE[type] ?? 'weekly_top'}
        ranked={type !== 'recent'}
      />
    </div>
  );
}

export default HomeFeaturedList;
