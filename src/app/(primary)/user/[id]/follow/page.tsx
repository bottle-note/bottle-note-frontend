'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import { useTab } from '@/hooks/useTab';
import List from '@/components/feature/List/List';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { RelationInfo } from '@/types/User';
import ListSection from '@/components/feature/List/ListSection';
import Tab from '@/components/ui/Navigation/Tab';
import { FollowApi } from '@/app/api/FollowApi';
import { FollowerListItem } from '../_components/FollowerListItem';

export default function UserFollowPage({
  params: { id: userId },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const currTapType = useSearchParams().get('type') ?? 'following';
  const { currentTab, handleTab, tabList } = useTab({
    tabList: [
      { name: '팔로잉', id: 'following' },
      { name: '팔로워', id: 'follower' },
    ] as const,
  });

  const {
    data: relationList,
    isLoading: isFirstLoading,
    isFetching,
    targetRef,
  } = usePaginatedQuery<{
    followingList?: RelationInfo[];
    followerList?: RelationInfo[];
    totalCount: number;
  }>({
    queryKey: ['follow', currentTab.id],
    queryFn: () => {
      return FollowApi.getRelationList({
        userId: Number(userId),
        type: currentTab.id,
      });
    },
  });

  useEffect(() => {
    handleTab(currTapType);
  }, []);

  return (
    <Suspense>
      <main>
        <SubHeader>
          <SubHeader.Left
            onClick={() => {
              router.back();
            }}
          >
            <Image
              src="/icon/arrow-left-subcoral.svg"
              alt="arrowIcon"
              width={23}
              height={23}
            />
          </SubHeader.Left>
          <SubHeader.Center>팔로잉 / 팔로워</SubHeader.Center>
        </SubHeader>

        <section className="pt-5 px-5 space-y-7.5">
          <Tab
            currentTab={currentTab}
            handleTab={handleTab}
            tabList={tabList}
          />

          {/* 현재 tab 이 <팔로잉>인 경우 */}
          {relationList && currentTab.id === 'following' && (
            <List
              emptyViewText={`아직 팔로잉중인 사람이 없습니다.\n다른 유저를 팔로우 해보세요!`}
              isListFirstLoading={isFirstLoading}
              isScrollLoading={isFetching}
            >
              <List.Title title="내가 팔로우 하는 유저" />
              <List.Total
                total={relationList[0].data.followingList?.length ?? 0}
                unit="명"
              />

              <ListSection className="flex flex-col">
                {relationList[0].data.followingList
                  ?.flat()
                  .map((item: RelationInfo, idx) => (
                    <FollowerListItem
                      key={`${item.userId}_${idx}`}
                      userInfo={{ ...item, userId: item.followUserId }}
                    />
                  ))}
              </ListSection>
              <div ref={targetRef} />
            </List>
          )}

          {/* 현재 tab 이 <팔로워>인 경우 */}
          {relationList && currentTab.id === 'follower' && (
            <List
              emptyViewText={`아직 팔로워가 없습니다.\n활동을 더욱 열심히 해보세요!`}
              isListFirstLoading={isFirstLoading}
              isScrollLoading={isFetching}
            >
              <List.Title title="나를 팔로우 하는 유저" />
              <List.Total
                total={relationList[0].data.followerList?.length ?? 0}
                unit="명"
              />

              <ListSection className="flex flex-col">
                {relationList[0].data.followerList
                  ?.flat()
                  .map((item: RelationInfo, idx) => (
                    <FollowerListItem
                      key={`${item.userId}_${idx}`}
                      userInfo={item}
                    />
                  ))}
              </ListSection>
              <div ref={targetRef} />
            </List>
          )}
        </section>
      </main>
    </Suspense>
  );
}
