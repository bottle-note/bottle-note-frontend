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

export default function UserFollowPage({
  params: { id: userId },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const historyType = useSearchParams().get('type');
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
    console.log(relationList);
  }, [relationList]);

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

          {relationList && (
            <List
              emptyViewText={`아직 활동한\n보틀이 없어요!`}
              isListFirstLoading={isFirstLoading}
              isScrollLoading={isFetching}
            >
              <List.Title title={currentTab.name} />
              <List.Total total={relationList[0].data.totalCount} />

              {relationList[0].data.followerList
                .flat()
                .map((item: RelationInfo) => (
                  // <List.Item key={item.followUserId} data={item} />
                  <span key={item.followUserId}>{item.nickName}</span>
                ))}
            </List>
          )}

          <div ref={targetRef} />
        </section>
      </main>
    </Suspense>
  );
}
