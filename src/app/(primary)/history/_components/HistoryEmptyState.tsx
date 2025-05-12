import React from 'react';
import EmptyView from '@/app/(primary)/_components/EmptyView';

interface HistoryEmptyStateProps {
  isLoading: boolean;
  error: unknown;
}

export const HistoryEmptyState = ({
  isLoading,
  error,
}: HistoryEmptyStateProps) => {
  const getEmptyViewText = () => {
    if (isLoading) return '데이터를 가져오고 있어요:)';
    if (error) return '데이터를 가져오지 못 했어요..';
    return '아직 히스토리가 없어요!';
  };

  return (
    <section className="w-full mt-3 mb-[26px]">
      <article className="py-5 w-full border-y border-mainGray/30">
        <EmptyView text={getEmptyViewText()} />
      </article>
    </section>
  );
};
