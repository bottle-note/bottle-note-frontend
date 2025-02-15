'use client';

import React, { useEffect, useState } from 'react';
import { ApiResponse } from '@/types/common';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import NavLayout from '@/app/(primary)/_components/NavLayout';
import SearchContainer from '@/components/Search/SearchContainer';
import TimeLineItem from '@/app/(primary)/_components/TimeLineItem';
import FilterSideModal from './_components/filter/FilterSideModal';
import Label from '@/app/(primary)/_components/Label';
import DescendingIcon from 'public/icon/descending-subcoral.svg';
import FilterIcon from 'public/icon/filter-subcoral.svg';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { HistoryApi } from '@/app/api/HistoryApi';
import { AuthService } from '@/lib/AuthService';
import { HistoryListApi, History as HistoryType } from '@/types/History';
import { groupHistoryByDate, shouldShowDivider } from '@/utils/historyUtils';
import { HistoryEmptyState } from './_components/HistoryEmptyState';

export default function History() {
  const router = useRouter();
  const { userData } = AuthService;
  const userId = userData?.userId;
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchCallback = () => {};

  const handleClose = () => {
    setIsOpen(false);
  };
  const {
    data: historyData,
    isLoading,
    error,
  } = usePaginatedQuery<HistoryListApi>({
    queryKey: ['history', userId],
    queryFn: async ({ pageParam }): Promise<ApiResponse<HistoryListApi>> => {
      return HistoryApi.getHistoryList({
        userId: String(userId),
        cursor: pageParam,
        pageSize: 20,
      });
    },
  });

  const historyList: HistoryType[] =
    (historyData && historyData[0].data.userHistories) || [];

  const groupedHistory = groupHistoryByDate(historyList);

  const yearMonths = Object.keys(groupedHistory).sort((a, b) =>
    b.localeCompare(a),
  );

  function getLatestYearMonth() {
    const latestYearMonth = yearMonths?.[0];
    if (!latestYearMonth) return null;

    const [year, month] = latestYearMonth.split('.').map(Number);
    return { year, month };
  }

  const dataChecking =
    historyData && historyData[0].data.totalCount !== 0 && !error && !isLoading;

  // !! 보틀노트 시작한 날짜 뽑기
  // !! 무한 스크롤 구현
  // !! 필터 구현

  return (
    <NavLayout>
      <SubHeader bgColor="bg-bgGray">
        <SubHeader.Left
          onClick={() => {
            router.back();
          }}
        >
          <Image
            src="/icon/arrow-left-subcoral.svg"
            alt="arrowIcon"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center textColor="text-subCoral">
          나의 히스토리
        </SubHeader.Center>
      </SubHeader>
      <main>
        <SearchContainer
          placeholder="위스키 이름 검색"
          handleSearchCallback={handleSearchCallback}
          styleProps="p-5"
          showRecentSearch={false}
        />
        <section className="p-5 mb-10">
          <div className="flex items-center justify-between mb-[0.65rem]">
            {historyData ? (
              <span className="text-xs text-mainGray shrink-0">{`총 ${historyData[0].data.totalCount}개`}</span>
            ) : (
              <span />
            )}
            <div className="flex items-center">
              <Image src={DescendingIcon} alt="내림차순" />
              <Image
                src={FilterIcon}
                alt="필터메뉴"
                onClick={() => setIsOpen(true)}
              />
            </div>
          </div>
          {dataChecking && (
            <>
              <div className="border-t border-mainGray/30 mb-[0.65rem]" />

              <article className="relative w-[339px]">
                <div className="absolute left-[2.7rem] top-6 bottom-0 w-px border-l border-dashed border-subCoral z-0" />
                <div className="text-10 text-mainGray bg-bgGray rounded-md p-2 mb-5 ml-3 relative z-10">
                  {getLatestYearMonth()?.year}년 {getLatestYearMonth()?.month}
                  월까지 기록된 회원닉네임님의 활동여정이에요!
                </div>
                <div className="relative z-10 pb-3">
                  {yearMonths.map((yearMonth, index) => {
                    const items = groupedHistory[yearMonth];
                    return (
                      <div key={yearMonth} className="relative">
                        {yearMonth !== yearMonths[0] && (
                          <div className="pl-4 mb-5">
                            <Label
                              name={yearMonth}
                              styleClass="border-white px-2.5 py-1 rounded-md text-11 bg-bgGray text-subCoral"
                            />
                          </div>
                        )}
                        <div className="z-10 space-y-5">
                          {items.map((item: HistoryType, itemIndex) => {
                            const prevItem =
                              itemIndex > 0 ? items[itemIndex - 1] : null;
                            const showDivider = shouldShowDivider(
                              item,
                              prevItem,
                            );
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
                                  text={item.message}
                                  alcoholId={item.alcoholId}
                                />
                              </React.Fragment>
                            );
                          })}
                        </div>
                        {index !== yearMonths.length - 1 && (
                          <div className="my-5" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="relative z-10 pb-3 mt-5">
                  <TimeLineItem
                    isStart
                    date="2024-01-19T14:35:12"
                    type="BOTTLE"
                  />
                </div>
              </article>
            </>
          )}
          <HistoryEmptyState
            isLoading={isLoading}
            error={error}
            totalCount={historyData?.[0]?.data.totalCount}
          />
        </section>
      </main>
      <FilterSideModal isOpen={isOpen} onClose={handleClose} />
    </NavLayout>
  );
}
