import { subYears, isAfter, isBefore } from 'date-fns';
import DateRangePicker from '@/components/ui/Form/DateRangePicker';
import { useHistoryFilterStore } from '@/store/historyFilterStore';

const MAX_YEARS = 2;

export default function HistoryFilterDateRange() {
  const { state: filterState, setDate } = useHistoryFilterStore();

  const getDateLimits = () => {
    const today = new Date();
    const twoYearsAgo = subYears(today, MAX_YEARS);
    return {
      minDate: twoYearsAgo,
      maxDate: today,
    };
  };

  const validateAndFixDates = (
    startDate: Date | null,
    endDate: Date | null,
  ) => {
    const today = new Date();
    const { minDate } = getDateLimits();
    let fixedStartDate = startDate;
    let fixedEndDate = endDate;

    // 날짜가 모두 null이면 그대로 유지 (필터 없음)
    if (!startDate && !endDate) {
      return {
        startDate: null,
        endDate: null,
      };
    }

    // 종료일이 오늘보다 미래면 오늘로 설정
    if (fixedEndDate && isAfter(fixedEndDate, today)) {
      fixedEndDate = today;
    }

    // 시작일이 최소 날짜보다 이전이면 최소 날짜로 설정
    if (fixedStartDate && isBefore(fixedStartDate, minDate)) {
      fixedStartDate = minDate;
    }

    return {
      startDate: fixedStartDate,
      endDate: fixedEndDate,
    };
  };

  const handleDate = (startDate: Date | null, endDate: Date | null) => {
    const { startDate: validStartDate, endDate: validEndDate } =
      validateAndFixDates(startDate, endDate);

    setDate({
      startDate: validStartDate,
      endDate: validEndDate,
    });
  };

  return (
    <DateRangePicker
      startDate={filterState.date.startDate}
      endDate={filterState.date.endDate}
      onChange={handleDate}
      minDate={getDateLimits().minDate}
      maxDate={getDateLimits().maxDate}
    />
  );
}
