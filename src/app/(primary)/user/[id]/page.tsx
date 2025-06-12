'use client';

import React, { useEffect, useState } from 'react';
import { UserInfoApi } from '@/types/User';
import { UserApi } from '@/app/api/UserApi';
import UserInfo from './_components/UserInfo';
import HistoryOverview from './_components/HistoryOverview';
import SidebarHeader from './_components/SidebarHeader';
import Timeline from './_components/Timeline';
import NavLayout from '../../_components/NavLayout';

export default function User({ params: { id } }: { params: { id: string } }) {
  const [userData, setUserData] = useState<UserInfoApi | null>(null);

  useEffect(() => {
    (async () => {
      const res = await UserApi.getUserInfo({ userId: id });
      setUserData(res);
    })();
  }, []);

  return (
    <NavLayout>
      <main className="text-mainBlack mb-24">
        <section className="bg-bgGray px-7.5 pb-[35px]">
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
        <section className="px-5 pt-9">
          <Timeline />
        </section>
      </main>
    </NavLayout>
  );
}
