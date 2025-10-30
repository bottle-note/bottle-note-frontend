import React from 'react';
import {
  RATINGS_FILTERS,
  REVIEW_FILTERS,
  LIKE_FILTERS,
} from '@/constants/history';
import { useHistoryFilterStore } from '@/store/historyFilterStore';
import SideFilterDrawer from '@/components/feature/SideFilterDrawer';
import HistoryFilterSection from './HistoryFilterSection';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryFilterModal({ isOpen, onClose }: Props) {
  const { resetFilter } = useHistoryFilterStore();

  return (
    <>
      {isOpen && (
        <SideFilterDrawer
          isOpen={isOpen}
          onClose={onClose}
          resetFilter={resetFilter}
        >
          <HistoryFilterSection title="별점" data={RATINGS_FILTERS} />
          <HistoryFilterSection title="리뷰" data={REVIEW_FILTERS} gridCols={3} />
          <HistoryFilterSection title="찜" data={LIKE_FILTERS} />
          <HistoryFilterSection title="기간" type="DATE" />
        </SideFilterDrawer>
      )}
    </>
  );
}
