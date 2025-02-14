import React, { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import TimeLineItem from '@/app/(primary)/_components/TimeLineItem';
import Label from '@/app/(primary)/_components/Label';
import LinkButton from '@/components/LinkButton';
import useModalStore from '@/store/modalStore';
import { AuthService } from '@/lib/AuthService';
import { History } from '@/types/History';
import { formatDate } from '@/utils/formatDate';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { HistoryApi } from '@/app/api/HistoryApi';

interface GroupHistoryOptions {
  limit?: number;
  shouldLimit?: boolean;
}

const groupHistoryByDate = (
  historyItems: History[],
  options: GroupHistoryOptions = {},
) => {
  const { limit = 7, shouldLimit = false } = options;

  const itemsToProcess = shouldLimit
    ? historyItems.slice(0, limit)
    : historyItems;

  const sortedItems = [...itemsToProcess].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const groupedItems = sortedItems.reduce(
    (acc, item) => {
      const yearMonth = formatDate(item.createdAt, 'YEAR_MONTH') as string;

      const newAcc = { ...acc };
      if (!newAcc[yearMonth]) {
        newAcc[yearMonth] = [];
      }
      newAcc[yearMonth].push(item);
      return newAcc;
    },
    {} as Record<string, History[]>,
  );

  return groupedItems;
};

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
  });

  const historyList: History[] =
    (historyData && historyData[0].data.userHistories) || [];
  const groupedHistory = groupHistoryByDate(historyList, {
    limit: 7,
    shouldLimit: true,
  });
  const gradientHeight = useMemo(() => {
    return historyData && historyData[0].data.totalCount <= 3
      ? '150px'
      : '400px';
  }, [historyData]);

  const getEmptyViewText = () => {
    if (isLoading) return '데이터를 가져오고 있어요:)';
    if (error) return '데이터를 가져오지 못 했어요..';
    return '히스토리가 없어요!';
  };

  if (
    (historyData && historyData[0].data.totalCount === 0) ||
    error ||
    isLoading
  ) {
    return (
      <section>
        <article className="py-5 border-y border-mainGray/30">
          <EmptyView text={getEmptyViewText()} />
        </article>
      </section>
    );
  }

  return (
    <article>
      <div>
        <div className="font-semibold">
          <p className="text-15 text-subCoral">나의 보틀 여정 히스토리</p>
          <p className="text-10 text-brightGray">
            별점, 평가,찜하기 활동내역을 살펴볼 수 있어요.
          </p>
        </div>
        <div className="border-t border-mainGray/30 my-3" />
        <div className="relative w-[339px]">
          <div className="absolute left-[2.7rem] top-6 bottom-0 w-px border-l border-dashed border-subCoral z-0" />
          <div className="relative z-10 pb-3">
            {Object.entries(groupedHistory).map(([yearMonth, items], index) => (
              <div key={yearMonth} className="relative">
                <div className="pl-4 mb-5">
                  <Label
                    name={yearMonth}
                    styleClass="border-white px-2.5 py-1 rounded-md text-11 bg-bgGray text-subCoral"
                  />
                </div>
                <div className="z-10 space-y-5">
                  {items.map((item: History, itemIndex) => (
                    <React.Fragment key={item.historyId}>
                      {itemIndex > 0 &&
                        formatDate(
                          items[itemIndex - 1].createdAt,
                          'FULL_DATE',
                        ) !== formatDate(item.createdAt, 'FULL_DATE') && (
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
                        text={item.message}
                        alcoholId={item.alcoholId}
                      />
                    </React.Fragment>
                  ))}
                </div>
                {index !== Object.keys(groupedHistory).length - 1 && (
                  <div className="my-5" />
                )}
              </div>
            ))}
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
  );
}

export default Timeline;
