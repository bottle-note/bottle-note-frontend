'use client';

import React from 'react';
import { useHomeFeaturedQuery } from '@/queries/useHomeFeaturedQuery';
import { useCurrentUserQuery } from '@/queries/useCurrentUserQuery';
import { useAuth } from '@/hooks/auth/useAuth';
import { LoadingStateSkeleton } from '@/components/ui/Loading/Skeletons/custom/PopularSkeleton';
import type { HomeFeaturedType } from '@/types/HomeFeatured';

import { HomeFeaturedDescription } from './_components/HomeFeaturedDescription';
import { HomeFeaturedItemList } from './_components/HomeFeaturedItemList';
import { HomeFeaturedEmptyState } from './_components/HomeFeaturedEmptyState';
import { HomeFeaturedErrorState } from './_components/HomeFeaturedErrorState';
import { HomeFeaturedLoginRequired } from './_components/HomeFeaturedLoginRequired';

interface Props {
  type?: HomeFeaturedType;
}

function HomeFeaturedList({ type = 'week' }: Props) {
  const { isLoggedIn } = useAuth();
  const requiresAuth = type === 'recent';

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

  // 'recent' 타입일 때만 유저 정보 조회
  const { data: currentUser } = useCurrentUserQuery({
    enabled: type === 'recent' && isLoggedIn && !isLoading,
  });

  // 로그인 필요 상태
  if (requiresAuth && !isLoggedIn) {
    return (
      <div className="h-[321px]">
        <HomeFeaturedLoginRequired />
      </div>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="h-[321px]">
        <LoadingStateSkeleton />
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="h-[321px]">
        <HomeFeaturedErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  // 빈 상태
  if (!featuredList || featuredList.length === 0) {
    return (
      <div className="h-[321px]">
        <HomeFeaturedEmptyState type={type} />
      </div>
    );
  }

  // 데이터 있음
  return (
    <div className="h-[321px]">
      <HomeFeaturedDescription type={type} nickname={currentUser?.nickname} />
      <HomeFeaturedItemList items={featuredList} />
    </div>
  );
}

export default HomeFeaturedList;
