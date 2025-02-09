import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import TimeLineItem from '@/app/(primary)/_components/TimeLineItem';
import Label from '@/app/(primary)/_components/Label';
import LinkButton from '@/components/LinkButton';
import useModalStore from '@/store/modalStore';
import { AuthService } from '@/lib/AuthService';
import { HistoryApi } from '@/types/History';
import { formatDate } from '@/utils/formatDate';

import { HISTORY_MOCK_LIST_ITEM } from '../../../../../../mock/history';

function Timeline() {
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

  const groupHistoryByDate = (historyItems: HistoryApi[]) => {
    const sortedItems = [...historyItems].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
      {} as Record<string, HistoryApi[]>,
    );

    return groupedItems;
  };

  const TEST_DATA: any[] = []; // HISTORY_MOCK_LIST_ITEM로 바꾸면 화면 확인 가능
  const groupedHistory = groupHistoryByDate(TEST_DATA);
  const gradientHeight = useMemo(() => {
    return TEST_DATA.length <= 3 ? '150px' : '400px';
  }, [TEST_DATA]);

  if (Object.keys(groupedHistory).length === 0) {
    return (
      <section>
        <article className="py-5 border-y border-mainGray/30">
          <EmptyView text="히스토리가 없어요!" />
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
                  {items.map((item: HistoryApi, itemIndex) => (
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
                        alcoholName={item.korName}
                        imageSrc={item.imageUrl}
                        type={item.eventCategory}
                        rating={item?.rating}
                        text={item?.reviewText}
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
