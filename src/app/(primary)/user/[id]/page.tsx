'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LinkButton from '@/components/LinkButton';
import { UserInfoApi } from '@/types/User';
import { UserApi } from '@/app/api/UserApi';
import useModalStore from '@/store/modalStore';
import { AuthService } from '@/lib/AuthService';
import UserInfo from './_components/UserInfo';
import HistoryOverview from './_components/HistoryOverview';
import SidebarHeader from './_components/SidebarHeader';
import Timeline from './_components/Timeline';
import NavLayout from '../../_components/NavLayout';

export default function User({ params: { id } }: { params: { id: string } }) {
  const [userData, setUserData] = useState<UserInfoApi | null>(null);
  const router = useRouter();
  const { handleModalState, handleLoginModal } = useModalStore();
  const { userData: loginUserData, isLogin } = AuthService;

  const handleConfirmUser = () => {
    if (!isLogin) {
      handleLoginModal();
      return;
    }

    // ! 아래 코드 주석처리 후 주석된 코드 주석 제거하면 확인 가능
    handleModalState({
      isShowModal: true,
      type: 'ALERT',
      mainText: '현재 기능 준비중입니다:)',
      handleConfirm: () => {
        handleModalState({
          isShowModal: false,
          mainText: '',
        });
      },
    });

    // if (loginUserData?.userId !== Number(id)) {
    //   handleModalState({
    //     isShowModal: true,
    //     type: 'ALERT',
    //     mainText: '여기까지 볼 수 있어요!',
    //     subText: '더 자세한 히스토리는 다른사람에게\n공유되지않아요~😘',
    //     handleConfirm: () => {
    //       handleModalState({
    //         isShowModal: false,
    //         mainText: '',
    //       });
    //     },
    //   });
    // } else {
    //   router.push('/history');
    // }
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
