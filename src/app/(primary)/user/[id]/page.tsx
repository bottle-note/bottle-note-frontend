'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserInfoApi } from '@/types/User';
import { UserApi } from '@/app/api/UserApi';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import Timeline from '@/components/domain/history/Timeline';
import PrimaryLinkButton from '@/components/ui/Button/PrimaryLinkButton';
import useModalStore from '@/store/modalStore';
import { useAuth } from '@/hooks/auth/useAuth';
import { History } from '@/types/History';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { HistoryApi } from '@/app/api/HistoryApi';
import { ROUTES } from '@/constants/routes';
import NavLayout from '@/components/ui/Layout/NavLayout';
import UserInfo from './_components/UserInfo';
import HistoryOverview from './_components/HistoryOverview';

export default function User({ params: { id } }: { params: { id: string } }) {
  const router = useRouter();
  const { handleModalState, handleLoginModal } = useModalStore();
  const { user: loginUserData, isLoggedIn } = useAuth();
  const [userData, setUserData] = useState<UserInfoApi | null>(null);

  const handleConfirmUser = () => {
    if (!isLoggedIn) {
      handleLoginModal();
      return;
    }

    if (loginUserData?.userId !== Number(id)) {
      handleModalState({
        isShowModal: true,
        mainText: '여기까지 볼 수 있어요!',
        subText: '더 자세한 히스토리는 다른사람에게\n공유되지않아요~😘',
      });
    } else {
      router.push(ROUTES.HISTORY.BASE);
    }
  };

  const {
    data: historyData,
    isLoading,
    error,
  } = usePaginatedQuery<{
    userHistories: History[];
    subscriptionDate: string;
    totalCount: number;
  }>({
    queryKey: ['history', id],
    queryFn: ({ pageParam }) => {
      return HistoryApi.getHistoryList({
        userId: String(id),
        cursor: pageParam,
        pageSize: 10,
      });
    },
    enabled: !!id,
  });

  useEffect(() => {
    (async () => {
      const res = await UserApi.getUserInfo({ userId: id });
      setUserData(res);
    })();
  }, [id]);

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
          <article>
            <div className="mb-[26px]">
              <div className="font-semibold">
                <p className="text-15 text-subCoral">나의 보틀 여정 히스토리</p>
                <p className="text-10 text-brightGray">
                  별점, 평가, 찜하기 활동내역을 살펴볼 수 있어요.
                </p>
              </div>

              <Timeline
                variant="preview"
                data={historyData}
                limit={7}
                showGradient={true}
                isLoading={isLoading}
                error={error}
              />
            </div>
            <PrimaryLinkButton
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
          </article>
        </section>
      </main>
    </NavLayout>
  );
}
