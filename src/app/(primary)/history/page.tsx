'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import NavLayout from '@/app/(primary)/_components/NavLayout';
import SearchContainer from '@/components/Search/SearchContainer';
import TimeLineItem from '@/app/(primary)/_components/TimeLineItem';
import Label from '@/app/(primary)/_components/Label';
import List from '@/components/List/List';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { HistoryApi } from '@/app/api/HistoryApi';
import { useHistoryFilterStore } from '@/store/historyFilterStore';
import { UserApi } from '@/app/api/UserApi';
import {
  HistoryListApi,
  History as HistoryType,
  HistoryListQueryParams,
} from '@/types/History';
import { RATING_NUM_VALUES, PICKS_STATUS } from '@/constants/history';
import { groupHistoryByDate, shouldShowDivider } from '@/utils/historyUtils';
import FilterSideModal from './_components/filter/FilterSideModal';
import { HistoryEmptyState } from './_components/HistoryEmptyState';
import FilterIcon from 'public/icon/filter-subcoral.svg';
import { CurrentUserInfoApi } from '@/types/User';

export default function History() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentParams, setCurrentParams] = useState(''); // 현재 적용된 파라미터
  const [processedHistory, setProcessedHistory] = useState<{
    groupedHistory: Record<string, HistoryType[]>;
    yearMonths: string[];
  }>({
    groupedHistory: {},
    yearMonths: [],
  });
  const [currentUserInfo, setCurrentUserInfo] =
    useState<CurrentUserInfoApi | null>(null);

  const { getQueryParams, setKeyword, resetFilter } = useHistoryFilterStore();

  const {
    data: historyData,
    isLoading,
    error,
    isFetching,
    targetRef,
    refetch,
  } = usePaginatedQuery<HistoryListApi>({
    queryKey: ['history', currentUserInfo?.id, currentParams],
    queryFn: async ({ pageParam }) => {
      const queryParams: HistoryListQueryParams = {
        userId: String(currentUserInfo?.id),
        cursor: pageParam,
        pageSize: 10,
      };

      const params = getQueryParams();
      const urlParams = new URLSearchParams();

      for (const [key, value] of params.entries()) {
        if (value === 'ALL') {
          switch (key) {
            case 'ratingPoint':
              RATING_NUM_VALUES.forEach((rating) =>
                urlParams.append(key, rating),
              );
              break;

            case 'picksStatus':
              Object.values(PICKS_STATUS).forEach((status) =>
                urlParams.append(key, status),
              );
              break;

            default:
              urlParams.append(key, value);
          }
        } else {
          urlParams.append(key, value);
        }
      }

      return HistoryApi.getHistoryList(queryParams, urlParams.toString());
    },
    enabled: !!currentUserInfo?.id,
  });

  const handleFilterChange = async () => {
    const newParams = getQueryParams().toString();
    setCurrentParams(newParams);
    await refetch();
  };

  useEffect(() => {
    if (!historyData?.length) return;

    const historyList = historyData.flatMap((page) => page.data.userHistories);
    const groupedHistory = groupHistoryByDate(historyList);
    const yearMonths = Object.keys(groupedHistory).sort((a, b) =>
      b.localeCompare(a),
    );

    setProcessedHistory({
      groupedHistory,
      yearMonths,
    });
  }, [historyData, isFetching]);

  const dataChecking =
    historyData &&
    historyData[0].data?.userHistories?.length > 0 &&
    !error &&
    !isLoading;

  const { groupedHistory, yearMonths } = processedHistory;

  function getLatestYearMonth() {
    const latestYearMonth = yearMonths?.[0];
    if (!latestYearMonth) return null;

    const [year, month] = latestYearMonth.split('.').map(Number);
    return { year, month };
  }

  const handleClose = async () => {
    setIsOpen(false);
    await handleFilterChange();
  };

  const handleSearchCallback = async (keyword: string) => {
    setKeyword(keyword);
    await handleFilterChange();
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await UserApi.getCurUserInfo();
      setCurrentUserInfo(userInfo);
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    return () => {
      setIsOpen(false);
      setCurrentParams('');
      setProcessedHistory({
        groupedHistory: {},
        yearMonths: [],
      });
      resetFilter();

      queryClient.removeQueries({
        queryKey: ['history'],
      });
    };
  }, [resetFilter, queryClient]);

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
        />
        <section className="p-5 mb-10 flex flex-col items-center w-full">
          <div className="flex items-center justify-between mb-[0.65rem] w-full">
            <span className="text-xs text-mainGray shrink-0">
              {historyData ? `총 ${historyData[0].data.totalCount}개` : ''}
            </span>
            <div className="flex items-center">
              <Image
                src={FilterIcon}
                alt="필터메뉴"
                onClick={() => setIsOpen(true)}
              />
            </div>
          </div>
          {dataChecking && (
            <>
              <div className="border-t border-mainGray/30 mb-[0.65rem] w-full" />
              <List isListFirstLoading={isLoading} isScrollLoading={isFetching}>
                <List.Section>
                  <article className="relative w-[339px]">
                    <div className="absolute left-[2.75rem] top-6 bottom-0 w-px border-l border-dashed border-subCoral z-0" />
                    <div className="text-10 text-mainGray bg-bgGray rounded-md p-2 mb-5 ml-3 relative z-10">
                      {getLatestYearMonth()?.year}년{' '}
                      {getLatestYearMonth()?.month}
                      월까지 기록된 {currentUserInfo?.nickname}님의
                      활동여정이에요!
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
                                      content={item.content}
                                      redirectUrl={item.redirectUrl}
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
                      <div className="relative pb-5">
                        <div className="absolute left-0 right-0 h-px bg-bgGray" />
                      </div>
                      <TimeLineItem
                        isStart
                        date={
                          (historyData &&
                            historyData[0].data?.subscriptionDate) ||
                          ''
                        }
                        type="BOTTLE"
                      />
                    </div>
                  </article>
                </List.Section>
              </List>
              <div ref={targetRef} />
            </>
          )}
          {!dataChecking && (
            <HistoryEmptyState
              isLoading={isLoading}
              error={error}
              totalCount={historyData && historyData[0].data?.totalCount}
            />
          )}
        </section>
      </main>
      <FilterSideModal isOpen={isOpen} onClose={handleClose} />
    </NavLayout>
  );
}
