import { create } from 'zustand';
import type {
  FilterState,
  ReviewFilterType,
  PicksStatus,
} from '@/types/History';

interface HistoryFilterStore {
  state: FilterState;
  setRatingPoint: (value: string[]) => void;
  setHistoryReviewFilterType: (value: ReviewFilterType[]) => void;
  setPicksStatus: (value: PicksStatus[]) => void;
  setDate: (value: { startDate: Date | null; endDate: Date | null }) => void;
  setKeyword: (value: string) => void;
  resetFilter: () => void;
  getQueryParams: () => URLSearchParams;
}

// 서버에서 param으로 요청하는 날짜 포맷으로 변경
const formatToNanoISOString = (isoString: string): string => {
  const formattedDate = isoString.replace('Z', '');
  const milliseconds = isoString.split('.')[1]?.slice(0, 3) || '000'; // 기존 ms 값 가져오기
  const nanoSeconds = milliseconds.padEnd(9, '0'); // 9자리로 확장

  return formattedDate.replace(/\.\d+/, `.${nanoSeconds}`);
};

const initialState: FilterState = {
  ratingPoint: [],
  historyReviewFilterType: [],
  picksStatus: [],
  date: { startDate: null, endDate: null },
  keyword: '',
};

export const useHistoryFilterStore = create<HistoryFilterStore>((set, get) => ({
  state: initialState,

  setRatingPoint: (value) =>
    set((prev) => ({
      state: {
        ...prev.state,
        ratingPoint: value,
      },
    })),

  setHistoryReviewFilterType: (value) =>
    set((prev) => ({
      state: {
        ...prev.state,
        historyReviewFilterType: value,
      },
    })),

  setPicksStatus: (value) =>
    set((prev) => ({
      state: {
        ...prev.state,
        picksStatus: value,
      },
    })),

  setDate: (value) =>
    set((prev) => ({
      state: {
        ...prev.state,
        date: value,
      },
    })),

  setKeyword: (value) =>
    set((prev) => ({
      state: {
        ...prev.state,
        keyword: value,
      },
    })),

  resetFilter: () => set({ state: initialState }),

  getQueryParams: () => {
    const { state } = get();
    const paramsObj: Record<string, string | string[]> = {};

    if (state.ratingPoint.length > 0) {
      paramsObj.ratingPoint = state.ratingPoint;
    }

    if (state.historyReviewFilterType.length > 0) {
      paramsObj.historyReviewFilterType =
        state.historyReviewFilterType.includes('ALL' as ReviewFilterType)
          ? ['ALL']
          : state.historyReviewFilterType;
    }

    if (state.picksStatus.length > 0) {
      paramsObj.picksStatus = state.picksStatus;
    }

    if (state.date.startDate || state.date.endDate) {
      paramsObj.startDate = state.date.startDate
        ? formatToNanoISOString(state.date.startDate.toISOString())
        : '';
      paramsObj.endDate = state.date.endDate
        ? formatToNanoISOString(state.date.endDate.toISOString())
        : '';
    }

    if (state.keyword) {
      paramsObj.keyword = state.keyword;
    }

    const params = new URLSearchParams();
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else {
        params.append(key, value);
      }
    });

    return params;
  },
}));
