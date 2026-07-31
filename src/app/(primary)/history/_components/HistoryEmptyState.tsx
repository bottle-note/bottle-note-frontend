import React from 'react';
import EmptyView from '@/components/ui/Display/EmptyView';

interface HistoryEmptyStateProps {
  isLoading?: boolean;
  isFiltering?: boolean;
  error: unknown;
}

export const HistoryEmptyState = ({
  isLoading,
  isFiltering = false,
  error,
}: HistoryEmptyStateProps) => {
  const getEmptyViewText = () => {
    if (isLoading) return '데이터를 가져오고 있어요:)';
    if (error) return '데이터를 가져오지 못 했어요..';
    if (isFiltering) return '필터 검색 결과가 없어요!';
    return '아직 히스토리가 없어요!';
  };

  return (
    <section className="mb-[26px] mt-3 w-full">
      <article className="w-full border-y border-stroke-neutral-subtle py-5">
        <EmptyView text={getEmptyViewText()} />
      </article>
    </section>
  );
};
