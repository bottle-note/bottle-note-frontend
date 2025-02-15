import React from 'react';
import EmptyView from '@/app/(primary)/_components/EmptyView';

interface HistoryEmptyStateProps {
  isLoading: boolean;
  error: unknown;
  totalCount?: number;
}

export const HistoryEmptyState = ({
  isLoading,
  error,
  totalCount = 0,
}: HistoryEmptyStateProps) => {
  const getEmptyViewText = () => {
    if (isLoading) return '데이터를 가져오고 있어요:)';
    if (error) return '데이터를 가져오지 못 했어요..';
    return '히스토리가 없어요!';
  };

  if (totalCount === 0 || error || isLoading) {
    return (
      <section>
        <article className="py-5 border-y border-mainGray/30">
          <EmptyView text={getEmptyViewText()} />
        </article>
      </section>
    );
  }

  return null;
};
