import React from 'react';
import {
  RATINGS_FILTERS,
  REVIEW_FILTERS,
  LIKE_FILTERS,
} from '@/constants/history';
import { useHistoryFilterStore } from '@/store/historyFilterStore';
import SideFilterDrawer from '@/components/feature/SideFilterDrawer';
import FilterGroup from './FilterGroup';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSideModal({ isOpen, onClose }: Props) {
  const { resetFilter } = useHistoryFilterStore();

  return (
    <>
      {isOpen && (
        <SideFilterDrawer
          isOpen={isOpen}
          onClose={onClose}
          resetFilter={resetFilter}
        >
          <FilterGroup title="별점" data={RATINGS_FILTERS} />
          <FilterGroup title="리뷰" data={REVIEW_FILTERS} gridCols={3} />
          <FilterGroup title="찜" data={LIKE_FILTERS} />
          <FilterGroup title="기간" type="DATE" />
        </SideFilterDrawer>
      )}
    </>
  );
}
