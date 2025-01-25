'use client';

import React, { useEffect, useState } from 'react';
import LinkButton from '@/components/LinkButton';
import { UserInfoApi } from '@/types/User';
import { UserApi } from '@/app/api/UserApi';
import UserInfo from './_components/UserInfo';
import HistoryOverview from './_components/HistoryOverview';
import SidebarHeader from './_components/SidebarHeader';
import Timeline from './_components/Timeline';
import NavLayout from '../../_components/NavLayout';
import useModalStore from '@/store/modalStore';
import { AuthService } from '@/lib/AuthService';

export default function User({ params: { id } }: { params: { id: string } }) {
  const [userData, setUserData] = useState<UserInfoApi | null>(null);
  const { handleModalState, handleLoginModal } = useModalStore();
  const { userData: loginUserData, isLogin } = AuthService;

  const handleConfirmUser = () => {
    if (!isLogin) {
      handleLoginModal();
      return;
    }

    if (loginUserData?.userId !== Number(id)) {
      handleModalState({
        isShowModal: true,
        type: 'ALERT',
        mainText: '여기까지 볼 수 있어요!',
        subText: '더 자세한 히스토리는 다른사람에게\n공유되지않아요~😘',
        handleConfirm: () => {
          handleModalState({
            isShowModal: false,
            mainText: '',
          });
        },
      });
    }
  };

  useEffect(() => {
    (async () => {
      const res = await UserApi.getUserInfo({ userId: id });
      setUserData(res);
    })();
  }, []);

  return (
    <NavLayout>
      <main className="text-mainBlack mb-24">
        <section className="bg-bgGray px-7.5 pb-7">
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
          <Timeline />
          <LinkButton
            data={{
              engName: 'HISTORY',
              korName: '활동 히스토리',
              linkSrc: `/history`,
              icon: true,
              handleBeforeRouteChange: (
                e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
              ) => {
                e.preventDefault();
                handleConfirmUser();
              },
            }}
          />
        </section>
      </main>
    </NavLayout>
  );
}
