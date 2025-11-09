import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { isWithinInterval, parseISO } from 'date-fns';
import List from '@/components/feature/List/List';
import { groupHistoryByDate } from '@/utils/historyUtils';
import { HistoryListApi, History as HistoryType } from '@/types/History';
import { CurrentUserInfoApi } from '@/types/User';
import { TimelineSkeleton } from '@/components/ui/Loading/Skeletons/custom/TimelineSkeleton';
import { HistoryEmptyState } from '@/app/(primary)/history/_components/HistoryEmptyState';
import TimelineMonthGroup from '@/components/domain/history/TimelineMonthGroup';
import TimeLineItem from '@/components/domain/history/TimeLineItem';
import { useHistoryFilterStore } from '@/store/historyFilterStore';
import FilterIcon from 'public/icon/filter-subcoral.svg';

export interface TimelineFullProps {
  data?: HistoryListApi;
  isLoading?: boolean;
  error?: Error | null;
  isLastPage: boolean;
  currentUserInfo: CurrentUserInfoApi | null;
  handleOpenFilterModal: () => void;
  shouldReset?: boolean;
  onResetComplete?: () => void;
  targetRef?: React.RefObject<HTMLDivElement>;
  isFetching?: boolean;
}

export default function TimelineFull({
  data,
  isLoading = false,
  error = null,
  isLastPage,
  currentUserInfo,
  handleOpenFilterModal,
  shouldReset = false,
  onResetComplete,
  targetRef,
  isFetching = false,
}: TimelineFullProps) {
  const { state: filterState } = useHistoryFilterStore();
  const [processedHistory, setProcessedHistory] = useState<{
    groupedHistory: Record<string, HistoryType[]>;
    yearMonths: string[];
  }>({
    groupedHistory: {},
    yearMonths: [],
  });

  const historyList: HistoryType[] = data?.userHistories || [];
  const totalCount = data?.totalCount || 0;
  const subscriptionDate = data?.subscriptionDate || '';

  function getLatestYearMonth() {
    const latestYearMonth = processedHistory.yearMonths?.[0];
    if (!latestYearMonth) return null;

    const [year, month] = latestYearMonth.split('.').map(Number);
    return { year, month };
  }

  function isSubscriptionDateInRange(subscriptionDate: string): boolean {
    if (!subscriptionDate) return false;
    if (!filterState.date.startDate || !filterState.date.endDate) return true;

    try {
      const subDate = parseISO(subscriptionDate);
      return isWithinInterval(subDate, {
        start: filterState.date.startDate,
        end: filterState.date.endDate,
      });
    } catch {
      return false;
    }
  }

  useEffect(() => {
    if (shouldReset) {
      setProcessedHistory({
        groupedHistory: {},
        yearMonths: [],
      });
      onResetComplete?.();
      return;
    }

    if (historyList.length === 0) {
      setProcessedHistory({
        groupedHistory: {},
        yearMonths: [],
      });
      return;
    }

    const grouped = groupHistoryByDate(historyList);
    const yearMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    setProcessedHistory({
      groupedHistory: grouped,
      yearMonths,
    });
  }, [historyList, shouldReset, onResetComplete]);

  if (isLoading || !data) {
    return (
      <section className="p-5 mb-10 flex flex-col items-center w-full">
        <div className="flex items-center justify-between mb-[0.65rem] w-full">
          <span className="text-xs text-mainGray shrink-0" />
          <div className="flex items-center">
            <Image src={FilterIcon} alt="필터메뉴" />
          </div>
        </div>
        <TimelineSkeleton type="history" />
      </section>
    );
  }

  const latestYearMonth = getLatestYearMonth();

  return (
    <section className="p-5 mb-10 flex flex-col items-center w-full">
      <div className="flex items-center justify-end mb-[0.65rem] w-full">
        <div className="flex items-center">
          <Image
            src={FilterIcon}
            alt="필터메뉴"
            onClick={() => handleOpenFilterModal()}
          />
        </div>
      </div>
      {data.userHistories.length !== 0 && !error ? (
        <List
          isListFirstLoading={false}
          isScrollLoading={isFetching}
          isError={!!error}
        >
          <List.Section>
            <article className="relative w-[339px]">
              <div className="absolute left-[2.67rem] top-6 bottom-0 w-px border-l border-dashed border-subCoral z-0" />
              <div className="text-10 text-mainGray bg-bgGray rounded-md p-2 mb-5 ml-3 relative z-10">
                {latestYearMonth?.year || 0}년 {latestYearMonth?.month || 0}
                월까지 기록된 {currentUserInfo?.nickname || ''}님의
                활동여정이에요!
              </div>
              <div className="relative z-10 pb-3">
                {processedHistory.yearMonths.map((yearMonth, index) => {
                  const items = processedHistory.groupedHistory[yearMonth];
                  return (
                    <TimelineMonthGroup
                      key={yearMonth}
                      yearMonth={yearMonth}
                      items={items}
                      isFirstGroup={index === 0}
                      isLastGroup={
                        index === processedHistory.yearMonths.length - 1
                      }
                    />
                  );
                })}
              </div>
              {isLastPage && isSubscriptionDateInRange(subscriptionDate) && (
                <div className="relative z-10 pb-3 mt-5">
                  <div className="relative pb-5">
                    <div className="absolute left-0 right-0 h-px bg-bgGray" />
                  </div>
                  <TimeLineItem isStart date={subscriptionDate} type="BOTTLE" />
                </div>
              )}
            </article>
          </List.Section>
        </List>
      ) : (
        <HistoryEmptyState
          isLoading={isLoading}
          error={error}
          isFiltering={totalCount !== 0 && data.userHistories.length === 0}
        />
      )}
      <div ref={targetRef} />
    </section>
  );
}
