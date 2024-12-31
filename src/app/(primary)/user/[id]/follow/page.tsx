'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import Tab from '@/components/Tab';
import { useTab } from '@/hooks/useTab';
import List from '@/components/List/List';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { UserApi } from '@/app/api/UserApi';
import { RelationInfo } from '@/types/User';
import ListSection from '@/components/List/ListSection';
import { FollowerListItem } from '../_components/FollowerListItem';

export default function UserFollowPage({
  params: { id: userId },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const historyType = useSearchParams().get('type') ?? 'following';
  const { currentTab, handleTab, tabList } = useTab({
    tabList: [
      { name: '팔로잉', id: 'following' },
      { name: '팔로워', id: 'follower' },
    ],
  });

  const {
    data: relationList,
    isLoading: isFirstLoading,
    isFetching,
    targetRef,
  } = usePaginatedQuery<{
    followingList: RelationInfo[];
    followerList: RelationInfo[];
    totalCount: number;
  }>({
    queryKey: ['follow'],
    queryFn: () => {
      return UserApi.getRelationList({
        userId: Number(userId),
      });
    },
  });

  useEffect(() => {
    handleTab(historyType);
  }, [historyType]);

  return (
    <Suspense>
      <main>
        <SubHeader bgColor="bg-bgGray">
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
          <SubHeader.Center textColor="text-subCoral">
            팔로잉 / 팔로워
          </SubHeader.Center>
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
                total={relationList[0].data.followingList.length}
                unit="명"
              />

              <ListSection className="flex flex-col">
                {relationList[0].data.followingList
                  .flat()
                  .map((item: RelationInfo) => (
                    <FollowerListItem key={item.userId} userInfo={item} />
                  ))}
              </ListSection>
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
                total={relationList[0].data.followerList.length}
                unit="명"
              />

              <ListSection className="flex flex-col">
                {relationList[0].data.followerList
                  .flat()
                  .map((item: RelationInfo) => (
                    <FollowerListItem key={item.userId} userInfo={item} />
                  ))}
              </ListSection>
            </List>
          )}

          <div ref={targetRef} />
        </section>
      </main>
    </Suspense>
  );
}
