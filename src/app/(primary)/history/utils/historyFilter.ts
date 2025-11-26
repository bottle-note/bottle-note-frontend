import { format } from 'date-fns';
import type { ReviewFilterType, PicksStatus } from '@/types/History';

export const filterUtils = {
  toString: {
    ratingPoint: (value: string[]) => value.join(','),
    historyReviewFilterType: (value: ReviewFilterType[]) => value.join(','),
    picksStatus: (value: PicksStatus[]) => value.join(','),
    date: (value: { startDate: Date | null; endDate: Date | null }) => {
      const startDateStr = value.startDate
        ? format(value.startDate, 'yyyy-MM-dd')
        : '';
      const endDateStr = value.endDate
        ? format(value.endDate, 'yyyy-MM-dd')
        : '';
      return `${startDateStr},${endDateStr}`;
    },
    keyword: (value: string) => value,
  },
  fromString: {
    ratingPoint: (value: string[] | null | undefined) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return (value as string).split(',').map((v: string) => v);
    },
    historyReviewFilterType: (
      value: string | ReviewFilterType[] | null | undefined,
    ) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return value.split(',') as ReviewFilterType[];
    },
    picksStatus: (value: string | PicksStatus[] | null | undefined) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return value.split(',') as PicksStatus[];
    },
    date: (
      value: string | { startDate: Date; endDate: Date } | null | undefined,
    ) => {
      if (!value) return { startDate: new Date(), endDate: new Date() };
      if (typeof value === 'object') return value;
      const [startDate, endDate] = value.split(',');
      return { startDate: new Date(startDate), endDate: new Date(endDate) };
    },
    keyword: (value: string | null | undefined) => {
      if (!value) return '';
      return value;
    },
  },
};

export const handleFilterValues = (
  currentValues: string | string[],
  newValue: string,
  setter: (values: any) => void,
) => {
  const currentArray = Array.isArray(currentValues)
    ? currentValues
    : [currentValues];

  if (newValue === 'ALL') {
    if (currentArray.includes('ALL')) {
      setter([]);
      return;
    }
    setter(['ALL']);
    return;
  }

  if (currentArray.includes('ALL')) {
    // ALL이 선택된 상태에서 다른 값을 선택하면 ALL 제거하고 새 값만 선택
    setter([newValue]);
    return;
  }

  if (currentArray.includes(newValue)) {
    setter(currentArray.filter((v) => v !== newValue));
  } else {
    setter([...currentArray, newValue]);
  }
};
