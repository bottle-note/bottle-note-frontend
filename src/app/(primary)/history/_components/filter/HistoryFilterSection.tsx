import React, { FC } from 'react';
import { REVIEW_FILTER_TYPES, PICKS_STATUS } from '@/constants/history';
import { ReviewFilterType, PicksStatus } from '@/types/History';
import { handleFilterValues } from '@/app/(primary)/history/utils/historyFilter';
import { Accordion } from '@/components/feature/SideFilterDrawer/Accordion';
import { useHistoryFilterStore } from '@/store/historyFilterStore';
import HistoryFilterDateRange from './HistoryFilterDateRange';

interface Props {
  type?: 'DATA' | 'DATE';
  title: string;
  data?: {
    name: string;
    value: string;
    icon?: FC<{ color?: string; className?: string; size?: number }>;
  }[];
  gridCols?: number;
}

export default function HistoryFilterSection({
  type = 'DATA',
  title,
  data,
  gridCols = 2,
}: Props) {
  const firstItem = (data && data[0]) ?? '';
  const restItems = data?.slice(1) ?? [];

  const {
    state: filterState,
    setRatingPoint,
    setHistoryReviewFilterType,
    setPicksStatus,
  } = useHistoryFilterStore();

  const handleFilter = (value: string) => {
    switch (title) {
      case '별점':
        handleFilterValues(filterState.ratingPoint, value, setRatingPoint);
        break;
      case '리뷰':
        handleFilterValues(
          filterState.historyReviewFilterType,
          value,
          (values) => setHistoryReviewFilterType(values as ReviewFilterType[]),
        );
        break;
      case '찜':
        handleFilterValues(filterState.picksStatus, value, (values) =>
          setPicksStatus(values as PicksStatus[]),
        );
        break;
      default:
        break;
    }
  };

  const checkValueExists = (value: string) => {
    switch (title) {
      case '별점':
        return filterState.ratingPoint.includes(value);
      case '리뷰':
        return filterState.historyReviewFilterType.includes(
          value as keyof typeof REVIEW_FILTER_TYPES,
        );
      case '찜':
        return filterState.picksStatus.includes(
          value as keyof typeof PICKS_STATUS,
        );
      case '기간':
        return (
          filterState.date.startDate?.toISOString() ===
            new Date(value).toISOString() ||
          filterState.date.endDate?.toISOString() ===
            new Date(value).toISOString()
        );
      default:
        return false;
    }
  };

  return (
    <Accordion title={title}>
      {type !== 'DATE' ? (
        <>
          <Accordion.Single>
            {firstItem && (
              <Accordion.Content
                title={firstItem.name}
                value={firstItem.value}
                IconComponent={firstItem.icon}
                isSelected={checkValueExists(firstItem.value)}
                onClick={handleFilter}
              />
            )}
          </Accordion.Single>
          {restItems.length > 0 && (
            <Accordion.Grid cols={gridCols}>
              {restItems.map((item) => (
                <Accordion.Content
                  key={item.name}
                  title={item.name}
                  value={item.value}
                  IconComponent={item.icon}
                  isSelected={checkValueExists(item.value)}
                  onClick={handleFilter}
                />
              ))}
            </Accordion.Grid>
          )}
        </>
      ) : (
        <HistoryFilterDateRange />
      )}
    </Accordion>
  );
}
