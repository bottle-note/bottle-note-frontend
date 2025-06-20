'use client';

import React, { useEffect, useState } from 'react';
import { UserInfoApi } from '@/types/User';
import { UserApi } from '@/app/api/UserApi';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import UserInfo from './_components/UserInfo';
import HistoryOverview from './_components/HistoryOverview';
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
        <SubHeader>
          <SubHeader.Left showLogo />
          <SubHeader.Right showSideMenu />
        </SubHeader>
        <section className="bg-white px-5">
          <section className="border-t border-subCoral">
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
        </section>
        <section className="px-5 pt-8">
          <Timeline />
        </section>
      </main>
    </NavLayout>
  );
}
