import React, { useState, useEffect, useMemo } from 'react';
import { groupHistoryByDate } from '@/app/(primary)/history/utils/historyUtils';
import { History as HistoryType } from '@/types/History';
import { ApiResponse } from '@/api/_shared/types';
import type { HistoryListResponse } from '@/api/history/types';
import { TimelineSkeleton } from '@/components/ui/Loading/Skeletons/custom/TimelineSkeleton';
import { HistoryEmptyState } from '@/app/(primary)/history/_components/HistoryEmptyState';
import TimelineMonthGroup from '@/components/domain/history/TimelineMonthGroup';

const EMPTY_HISTORY_LIST: HistoryType[] = [];

export interface TimelinePreviewProps {
  data?: ApiResponse<HistoryListResponse>[];
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

  const historyList: HistoryType[] =
    historyData?.userHistories ?? EMPTY_HISTORY_LIST;
  const loadedCount = historyList.length;

  let gradientHeight = '0px';
  if (showGradient) {
    if (loadedCount < 3) gradientHeight = '0px';
    else if (loadedCount === 3) gradientHeight = '150px';
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

  if (loadedCount === 0 || error) {
    return <HistoryEmptyState error={error} />;
  }

  return (
    <>
      <div className="my-3 border-t border-stroke-neutral-subtle" />
      <div
        data-testid="timeline-preview"
        className="relative mx-auto w-full max-w-[399px]"
      >
        <div
          data-testid="timeline-axis"
          className="absolute bottom-0 left-11 top-6 z-0 w-px border-l border-dashed border-stroke-brand-solid"
        />
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
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-b from-transparent to-bg-layer-default"
            style={{ height: gradientHeight }}
          />
        )}
      </div>
      <div className="mb-2" />
    </>
  );
}
