import { subMonths, subYears, isAfter, isBefore } from 'date-fns';
import DateRangePicker from '@/components/ui/Form/DateRangePicker';
import { useHistoryFilterStore } from '@/store/historyFilterStore';

const MAX_YEARS = 2;

export default function HistoryFilterDateRange() {
  const { state: filterState, setDate } = useHistoryFilterStore();

  const getDefaultDates = () => {
    const today = new Date();
    const monthAgo = subMonths(today, 1);
    return {
      startDate: monthAgo,
      endDate: today,
    };
  };

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

    if (!fixedEndDate) {
      fixedEndDate = today;
    }

    if (isAfter(fixedEndDate, today)) {
      fixedEndDate = today;
    }

    if (!fixedStartDate) {
      fixedStartDate = subMonths(fixedEndDate, 1);
    }

    if (isBefore(fixedStartDate, minDate)) {
      fixedStartDate = minDate;
    }

    if (!startDate && !endDate) {
      const defaultDates = getDefaultDates();
      fixedStartDate = defaultDates.startDate;
      fixedEndDate = defaultDates.endDate;
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
    <div className="px-5 py-3 bg-sectionWhite z-50">
      <DateRangePicker
        startDate={filterState.date.startDate || getDefaultDates().startDate}
        endDate={filterState.date.endDate || getDefaultDates().endDate}
        onChange={handleDate}
        minDate={getDateLimits().minDate}
        maxDate={getDateLimits().maxDate}
      />
    </div>
  );
}
