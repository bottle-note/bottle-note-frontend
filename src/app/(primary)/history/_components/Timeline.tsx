import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import TimeLineItem from '@/app/(primary)/_components/TimeLineItem';
import Label from '@/app/(primary)/_components/Label';
import List from '@/components/List/List';
import { groupHistoryByDate, shouldShowDivider } from '@/utils/historyUtils';
import { HistoryListApi, History as HistoryType } from '@/types/History';
import { CurrentUserInfoApi } from '@/types/User';
import { HistoryEmptyState } from './HistoryEmptyState';
import FilterIcon from 'public/icon/filter-subcoral.svg';

interface Props {
  data: HistoryListApi;
  isLastPage?: boolean;
  currentUserInfo: CurrentUserInfoApi | null;
  handleOpenFilterModal: () => void;
  shouldReset: boolean;
  onResetComplete: () => void;
  targetRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
}

export default function Timeline({
  data,
  isLastPage = false,
  currentUserInfo,
  handleOpenFilterModal,
  shouldReset,
  onResetComplete,
  targetRef,
  isLoading,
  isFetching,
  error,
}: Props) {
  const [processedHistory, setProcessedHistory] = useState<{
    groupedHistory: Record<string, HistoryType[]>;
    yearMonths: string[];
  }>({
    groupedHistory: {},
    yearMonths: [],
  });

  useEffect(() => {
    if (shouldReset) {
      setProcessedHistory({
        groupedHistory: {},
        yearMonths: [],
      });
      onResetComplete();
    }
  }, [shouldReset, onResetComplete]);

  useEffect(() => {
    if (data.userHistories?.length) {
      const groupedHistory = groupHistoryByDate(data.userHistories);
      const yearMonths = Object.keys(groupedHistory).sort((a, b) =>
        b.localeCompare(a),
      );

      setProcessedHistory({
        groupedHistory,
        yearMonths,
      });
    }
  }, [data]);

  const { groupedHistory, yearMonths } = processedHistory;

  function getLatestYearMonth() {
    const latestYearMonth = yearMonths?.[0];
    if (!latestYearMonth) return null;

    const [year, month] = latestYearMonth.split('.').map(Number);
    return { year, month };
  }
  return (
    <section className="p-5 mb-10 flex flex-col items-center w-full">
      <div className="flex items-center justify-between mb-[0.65rem] w-full">
        <span className="text-xs text-mainGray shrink-0">
          {data ? `총 ${data.totalCount}개` : ''}
        </span>
        <div className="flex items-center">
          <Image
            src={FilterIcon}
            alt="필터메뉴"
            onClick={() => handleOpenFilterModal()}
          />
        </div>
      </div>
      <List
        isListFirstLoading={isLoading}
        isScrollLoading={isFetching}
        isError={!!error}
      >
        <List.Section>
          {data.userHistories?.length > 0 && !error && !isLoading && (
            <article className="relative w-[339px]">
              <div className="absolute left-[2.75rem] top-6 bottom-0 w-px border-l border-dashed border-subCoral z-0" />
              <div className="text-10 text-mainGray bg-bgGray rounded-md p-2 mb-5 ml-3 relative z-10">
                {getLatestYearMonth()?.year}년 {getLatestYearMonth()?.month}
                월까지 기록된 {currentUserInfo?.nickname}님의 활동여정이에요!
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
                      {index !== yearMonths.length - 1 && (
                        <div className="my-5" />
                      )}
                    </div>
                  );
                })}
              </div>
              {isLastPage && (
                <div className="relative z-10 pb-3 mt-5">
                  <div className="relative pb-5">
                    <div className="absolute left-0 right-0 h-px bg-bgGray" />
                  </div>
                  <TimeLineItem
                    isStart
                    date={data.subscriptionDate || ''}
                    type="BOTTLE"
                  />
                </div>
              )}
            </article>
          )}
        </List.Section>
      </List>
      <div ref={targetRef} />
      {(error || isLoading || !(data.userHistories?.length > 0)) && (
        <HistoryEmptyState
          isLoading={isLoading}
          error={error}
          totalCount={data.userHistories?.length}
        />
      )}
    </section>
  );
}
