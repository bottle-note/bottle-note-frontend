import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import TimeLineItem from '@/components/domain/user/TimeLineItem';
import Label from '@/components/ui/Display/Label';
import List from '@/components/feature/List/List';
import { groupHistoryByDate, shouldShowDivider } from '@/utils/historyUtils';
import { HistoryListApi, History as HistoryType } from '@/types/History';
import { CurrentUserInfoApi } from '@/types/User';
import { ApiResponse } from '@/types/common';
import { TimelineSkeleton } from '@/components/ui/Loading/Skeletons/custom/TimelineSkeleton';
import { HistoryEmptyState } from '@/app/(primary)/history/_components/HistoryEmptyState';
import FilterIcon from 'public/icon/filter-subcoral.svg';

interface TimelineProps {
  // 공통 props
  data?:
    | HistoryListApi
    | ApiResponse<{
        userHistories: HistoryType[];
        subscriptionDate: string;
        totalCount: number;
      }>[];
  isLoading?: boolean;
  error?: Error | null;

  // 모드 구분
  variant?: 'full' | 'preview';

  // Full 모드 props (History 페이지용)
  isLastPage?: boolean;
  currentUserInfo?: CurrentUserInfoApi | null;
  handleOpenFilterModal?: () => void;
  shouldReset?: boolean;
  onResetComplete?: () => void;
  targetRef?: React.RefObject<HTMLDivElement>;
  isFetching?: boolean;

  // Preview 모드 props (Profile 페이지용)
  limit?: number;
  showGradient?: boolean;
}

export default function Timeline({
  data,
  isLoading = false,
  error = null,
  variant = 'full',
  isLastPage = false,
  currentUserInfo = null,
  handleOpenFilterModal,
  shouldReset = false,
  onResetComplete,
  targetRef,
  isFetching = false,
  limit = 7,
  showGradient = false,
}: TimelineProps) {
  const [processedHistory, setProcessedHistory] = useState<{
    groupedHistory: Record<string, HistoryType[]>;
    yearMonths: string[];
  }>({
    groupedHistory: {},
    yearMonths: [],
  });

  // 데이터 추출 (두 가지 데이터 구조 지원)
  const historyData: HistoryListApi | null = useMemo(() => {
    if (!data) return null;

    // Full 모드: HistoryListApi 구조
    if ('userHistories' in data) {
      return data;
    }

    // Preview 모드: ApiResponse 배열 구조
    if (Array.isArray(data) && data.length > 0) {
      return data[0].data;
    }

    return null;
  }, [data]);

  const historyList: HistoryType[] = historyData?.userHistories || [];
  const totalCount = historyData?.totalCount || 0;
  const subscriptionDate = historyData?.subscriptionDate || '';

  // Preview 모드에서 그라데이션 높이 계산
  const gradientHeight = useMemo(() => {
    if (variant === 'preview' && showGradient) {
      if (totalCount < 3) return '0px';
      if (totalCount === 3) return '150px';
      return '400px';
    }
    return '0px';
  }, [variant, showGradient, totalCount]);

  // Full 모드에서 최신 년월 계산
  function getLatestYearMonth() {
    const latestYearMonth = processedHistory.yearMonths?.[0];
    if (!latestYearMonth) return null;

    const [year, month] = latestYearMonth.split('.').map(Number);
    return { year, month };
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

    const options = variant === 'preview' ? { limit, shouldLimit: true } : {};
    const grouped = groupHistoryByDate(historyList, options);
    const yearMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    setProcessedHistory({
      groupedHistory: grouped,
      yearMonths,
    });
  }, [historyList, shouldReset, variant, limit, onResetComplete]);

  // Full 모드 렌더링
  if (variant === 'full') {
    if (isLoading || !historyData) {
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

    return (
      <section className="p-5 mb-10 flex flex-col items-center w-full">
        <div className="flex items-center justify-between mb-[0.65rem] w-full">
          <span className="text-xs text-mainGray shrink-0">
            {historyData ? `총 ${historyData.totalCount}개` : ''}
          </span>
          <div className="flex items-center">
            <Image
              src={FilterIcon}
              alt="필터메뉴"
              onClick={() => handleOpenFilterModal?.()}
            />
          </div>
        </div>
        {historyData.userHistories.length !== 0 && !error ? (
          <List
            isListFirstLoading={false}
            isScrollLoading={isFetching}
            isError={!!error}
          >
            <List.Section>
              <article className="relative w-[339px]">
                <div className="absolute left-[2.75rem] top-6 bottom-0 w-px border-l border-dashed border-subCoral z-0" />
                <div className="text-10 text-mainGray bg-bgGray rounded-md p-2 mb-5 ml-3 relative z-10">
                  {getLatestYearMonth()?.year}년 {getLatestYearMonth()?.month}
                  월까지 기록된 {currentUserInfo?.nickname}님의 활동여정이에요!
                </div>
                <div className="relative z-10 pb-3">
                  {processedHistory.yearMonths.map((yearMonth, index) => {
                    const items = processedHistory.groupedHistory[yearMonth];
                    return (
                      <div key={yearMonth} className="relative">
                        {yearMonth !== processedHistory.yearMonths[0] && (
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
                        {index !== processedHistory.yearMonths.length - 1 && (
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
                      date={subscriptionDate}
                      type="BOTTLE"
                    />
                  </div>
                )}
              </article>
            </List.Section>
          </List>
        ) : (
          <HistoryEmptyState
            isLoading={isLoading}
            error={error}
            isFiltering={
              historyData.totalCount !== 0 &&
              historyData.userHistories.length === 0
            }
          />
        )}
        <div ref={targetRef} />
      </section>
    );
  }

  // Preview 모드 렌더링 (기존 로직 유지)
  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (totalCount === 0 || error) {
    return <HistoryEmptyState error={error} />;
  }

  return (
    <>
      <div className="border-t border-mainGray/30 my-3" />
      <div className="relative w-[339px] mx-auto">
        <div className="absolute left-[2.7rem] top-6 bottom-0 w-px border-l border-dashed border-subCoral z-0" />
        <div className="relative z-10 pb-3">
          {Object.entries(processedHistory.groupedHistory).map(
            ([yearMonth, items], index) => (
              <div key={yearMonth} className="relative">
                <div className="pl-4 mb-5">
                  <Label
                    name={yearMonth}
                    styleClass="border-white px-2.5 py-1 rounded-md text-11 bg-bgGray text-subCoral"
                  />
                </div>
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
                {index !==
                  Object.keys(processedHistory.groupedHistory).length - 1 && (
                  <div className="my-5" />
                )}
              </div>
            ),
          )}
        </div>
        {showGradient && (
          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-none z-10"
            style={{
              height: gradientHeight,
              background:
                'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
            }}
          />
        )}
      </div>
      <div className="mb-2" />
    </>
  );
}
