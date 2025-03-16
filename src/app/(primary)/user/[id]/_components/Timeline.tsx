import React, { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TimeLineItem from '@/app/(primary)/_components/TimeLineItem';
import Label from '@/app/(primary)/_components/Label';
import LinkButton from '@/components/LinkButton';
import useModalStore from '@/store/modalStore';
import { AuthService } from '@/lib/AuthService';
import { History } from '@/types/History';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { HistoryApi } from '@/app/api/HistoryApi';
import { groupHistoryByDate, shouldShowDivider } from '@/utils/historyUtils';
import { HistoryEmptyState } from '@/app/(primary)/history/_components/HistoryEmptyState';

function Timeline() {
  const router = useRouter();
  const { id: userId } = useParams();
  const { handleModalState, handleLoginModal } = useModalStore();
  const { userData: loginUserData, isLogin } = AuthService;

  const handleConfirmUser = () => {
    if (!isLogin) {
      handleLoginModal();
      return;
    }

    if (loginUserData?.userId !== Number(userId)) {
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
    } else {
      router.push('/history');
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
    queryKey: ['history', userId],
    queryFn: ({ pageParam }) => {
      return HistoryApi.getHistoryList({
        userId: String(userId),
        cursor: pageParam,
        pageSize: 10,
      });
    },
    enabled: !!userId,
  });

  const historyList: History[] =
    (historyData && historyData[0].data.userHistories) || [];
  const groupedHistory = groupHistoryByDate(historyList, {
    limit: 7,
    shouldLimit: true,
  });

  const gradientHeight = useMemo(() => {
    if (historyData) {
      if (historyData[0].data.totalCount < 3) return '0px';
      if (historyData[0].data.totalCount === 3) return '150px';
      return '400px';
    }
  }, [historyData]);

  return (
    <>
      <article>
        <div>
          <div className="font-semibold">
            <p className="text-15 text-subCoral">나의 보틀 여정 히스토리</p>
            <p className="text-10 text-brightGray">
              별점, 평가,찜하기 활동내역을 살펴볼 수 있어요.
            </p>
          </div>
          <div className="border-t border-mainGray/30 my-3" />
          <div className="relative w-[339px] mx-auto">
            <div className="absolute left-[2.7rem] top-6 bottom-0 w-px border-l border-dashed border-subCoral z-0" />
            <div className="relative z-10 pb-3">
              {Object.entries(groupedHistory).map(
                ([yearMonth, items], index) => (
                  <div key={yearMonth} className="relative">
                    <div className="pl-4 mb-5">
                      <Label
                        name={yearMonth}
                        styleClass="border-white px-2.5 py-1 rounded-md text-11 bg-bgGray text-subCoral"
                      />
                    </div>
                    <div className="z-10 space-y-5">
                      {items.map((item: History, itemIndex) => {
                        const prevItem =
                          itemIndex > 0 ? items[itemIndex - 1] : null;
                        const showDivider = shouldShowDivider(item, prevItem);
                        return (
                          <React.Fragment key={item.historyId}>
                            {showDivider && (
                              <div className="relative py-1">
                                <div className="absolute left-0 right-0 h-px bg-bgGray" />
                              </div>
                            )}
                            <TimeLineItem
                              date={item.createdAt}
                              alcoholName={item.alcoholName}
                              imageSrc={item.imageUrl}
                              type={item.eventType}
                              rate={item.dynamicMessage}
                              content={item.content}
                              redirectUrl={item.redirectUrl}
                            />
                          </React.Fragment>
                        );
                      })}
                    </div>
                    {index !== Object.keys(groupedHistory).length - 1 && (
                      <div className="my-5" />
                    )}
                  </div>
                ),
              )}
            </div>

            <div
              className="absolute left-0 right-0 bottom-0 pointer-events-none z-10"
              style={{
                height: gradientHeight,
                background:
                  'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
              }}
            />
          </div>
          <div className="mb-2" />
        </div>
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
      </article>
      <HistoryEmptyState
        isLoading={isLoading}
        error={error}
        totalCount={historyData?.[0]?.data.totalCount}
      />
    </>
  );
}

export default Timeline;
