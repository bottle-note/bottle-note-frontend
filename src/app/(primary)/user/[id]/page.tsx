'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserApi } from '@/api/user/user.api';
import { UserInfo as UserInfoType } from '@/api/user/types';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import TimelinePreview from '@/components/domain/history/TimelinePreview';
import PrimaryLinkButton from '@/components/ui/Button/PrimaryLinkButton';
import useModalStore from '@/store/modalStore';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { HistoryApi } from '@/api/history/history.api';
import { History } from '@/api/history/types';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ROUTES } from '@/constants/routes';
import NavLayout from '@/components/ui/Layout/NavLayout';
import UserInfo from './_components/UserInfo';
import HistoryOverview from './_components/HistoryOverview';

export default function User({ params: { id } }: { params: { id: string } }) {
  const router = useRouter();
  const { handleModalState, handleLoginModal } = useModalStore();
  const { user: loginUserData, isLoggedIn } = useAuthSession();
  const [userData, setUserData] = useState<UserInfoType | null>(null);

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
    enabled: Boolean(id) && isLoggedIn,
  });

  useEffect(() => {
    (async () => {
      const res = await UserApi.getUserInfo({ userId: id });
      setUserData(res.data);
    })();
  }, [id]);

  const isMyPage = loginUserData?.userId === Number(id);
  const nickName = userData?.nickName;

  const historyTitle = (() => {
    if (isMyPage) return '나의 보틀 여정 히스토리';
    if (nickName) return `${nickName}의 보틀 여정 히스토리`;
    return '';
  })();

  return (
    <NavLayout>
      <main
        data-testid="user-profile-page"
        className="mb-24 bg-bg-layer-default text-fg-neutral"
      >
        <SubHeader>
          <SubHeader.Left>
            <SubHeader.Logo />
          </SubHeader.Left>
          <SubHeader.Right>
            <SubHeader.Menu />
          </SubHeader.Right>
        </SubHeader>
        <section className="bg-bg-layer-default px-5">
          <section className="border-t border-stroke-brand-solid">
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
                <p className="text-15 text-fg-brand">{historyTitle}</p>
                <p className="text-10 text-fg-neutral-muted">
                  별점, 평가, 찜하기 활동내역을 살펴볼 수 있어요.
                </p>
              </div>

              <TimelinePreview
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
