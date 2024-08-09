'use client';

import React, { useEffect, useState } from 'react';
import List from '@/components/List/List';
import LinkButton from '@/components/LinkButton';
import { usePopularList } from '@/hooks/usePopularList';
import { UserInfoApi } from '@/types/User';
import { UserApi } from '@/app/api/UserApi';
import UserInfo from './_components/UserInfo';
import HistoryOverview from './_components/HistoryOverview';
import SidebarHeader from './_components/SidebarHeader';
import NavLayout from '../../_components/NavLayout';

// TODO:
// 2. 활동 내역 가져오는 api 연동
// 3. 기타 버튼 액션과 관련된 api 연동
export default function User({ params: { id } }: { params: { id: string } }) {
  // FIXME: 활동 내역 가져오기 데이터로 변동
  const { popularList } = usePopularList();
  const [userData, setUserData] = useState<UserInfoApi | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await UserApi.getUserInfo({ userId: id });
        setUserData(res);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <NavLayout>
      <main className="text-mainBlack mb-24">
        <section className="bg-bgGray p-7.5 pb-7">
          <SidebarHeader />
          <UserInfo
            profileImgSrc={userData?.imageUrl ?? null}
            follower={userData?.followerCount ?? 0}
            following={userData?.followingCount ?? 0}
            isFollowing={userData?.isFollow}
            currentId={id}
            nickName={userData?.nickName ?? ''}
          />
          <HistoryOverview
            rates={userData?.ratingCount ?? 0}
            reviews={userData?.reviewCount ?? 0}
            likes={userData?.pickCount ?? 0}
            id={Number(id)}
          />
        </section>

        <section className="px-5 pt-9 flex flex-col gap-5">
          <List emptyViewText={`아직 활동한\n보틀이 없어요!`}>
            <List.Total total={popularList.length} />
            {popularList.map((item) => (
              <List.Item data={item} key={item.alcoholId} />
            ))}
          </List>

          <LinkButton
            data={{
              engName: 'HISTORY',
              korName: '활동 히스토리',
              linkSrc: `/user/${id}/history?type=all`,
              icon: true,
            }}
          />
        </section>
      </main>
    </NavLayout>
  );
}
