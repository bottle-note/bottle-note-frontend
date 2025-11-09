import React, { useState, useEffect, useMemo } from 'react';
import { groupHistoryByDate } from '@/utils/historyUtils';
import { History as HistoryType } from '@/types/History';
import { ApiResponse } from '@/types/common';
import { TimelineSkeleton } from '@/components/ui/Loading/Skeletons/custom/TimelineSkeleton';
import { HistoryEmptyState } from '@/app/(primary)/history/_components/HistoryEmptyState';
import TimelineMonthGroup from '@/components/domain/history/TimelineMonthGroup';

export interface TimelinePreviewProps {
  data?: ApiResponse<{
    userHistories: HistoryType[];
    subscriptionDate: string;
    totalCount: number;
  }>[];
  isLoading?: boolean;
  error?: Error | null;
  limit?: number;
  showGradient?: boolean;
}

export default function TimelinePreview({
  data,
  isLoading = false,
  error = null,
  limit = 7,
  showGradient = false,
}: TimelinePreviewProps) {
  const [processedHistory, setProcessedHistory] = useState<{
    groupedHistory: Record<string, HistoryType[]>;
    yearMonths: string[];
  }>({
    groupedHistory: {},
    yearMonths: [],
  });

  const historyData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0].data;
  }, [data]);

  const historyList: HistoryType[] = historyData?.userHistories || [];
  const totalCount = historyData?.totalCount || 0;

  let gradientHeight = '0px';
  if (showGradient) {
    if (totalCount < 3) gradientHeight = '0px';
    else if (totalCount === 3) gradientHeight = '150px';
    else gradientHeight = '400px';
  }

  useEffect(() => {
    if (historyList.length === 0) {
      setProcessedHistory({
        groupedHistory: {},
        yearMonths: [],
      });
      return;
    }

    const grouped = groupHistoryByDate(historyList, {
      limit,
      shouldLimit: true,
    });
    const yearMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    setProcessedHistory({
      groupedHistory: grouped,
      yearMonths,
    });
  }, [historyList, limit]);

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
              <TimelineMonthGroup
                key={yearMonth}
                yearMonth={yearMonth}
                items={items}
                isLastGroup={
                  index ===
                  Object.keys(processedHistory.groupedHistory).length - 1
                }
              />
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
