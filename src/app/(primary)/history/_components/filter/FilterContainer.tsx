import React, { FC } from 'react';
import { REVIEW_FILTER_TYPES, PICKS_STATUS } from '@/constants/history';
import { ReviewFilterType, PicksStatus } from '@/types/History';
import { handleFilterValues } from '@/utils/historyFilter';
import { useHistoryFilterStore } from '@/store/historyFilterStore';
import DateRangeFilter from './DateRangeFilter';
import ToggleContainer from './ToggleContainer';
import FilterOption from './FilterOption';
import ToggleDarkGrayIcon from 'public/icon/arrow-down-darkgray.svg';

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

export default function FilterContainer({
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
    <article>
      <ToggleContainer title={title} toggleIcon={ToggleDarkGrayIcon}>
        {type === 'DATA' ? (
          <div className="py-3 px-5 bg-sectionWhite">
            {firstItem && (
              <div className="mb-1">
                <FilterOption
                  key={0}
                  value={firstItem.value}
                  title={firstItem.name}
                  IconComponent={firstItem?.icon}
                  onClick={handleFilter}
                  isSelected={checkValueExists(firstItem.value)}
                />
              </div>
            )}
            {restItems.length > 0 && (
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                }}
              >
                {restItems.map((item) => (
                  <FilterOption
                    key={item.name}
                    value={item.value}
                    title={item.name}
                    IconComponent={item.icon}
                    onClick={handleFilter}
                    isSelected={checkValueExists(item.value)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <DateRangeFilter />
        )}
      </ToggleContainer>
    </article>
  );
}
