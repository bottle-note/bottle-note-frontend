import { DateFormat, TimeFormat } from '@/types/FormatDate';

export function formatDate(
  dateString: string,
  format: DateFormat = 'FULL_DATE',
): string | TimeFormat {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  switch (format) {
    case 'FULL_DATE':
      return `${year}.${month}.${day}`;
    case 'YEAR_MONTH':
      return `${year}.${month}`;
    case 'MONTH_DATE_TIME':
      return {
        date: `${month}.${day}`,
        time: `${hours}:${minutes}`,
      };
    default:
      return `${year}.${month}.${day}`;
  }
}

export const getDateOnlyTime = (dateValue: string) => {
  const [datePart] = dateValue.split('T');
  const [year, month, date] = datePart.split('-').map(Number);

  if (year && month && date) {
    return new Date(year, month - 1, date).getTime();
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
  ).getTime();
};

export const getTodayTime = () => {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
};

export const isBeforeToday = (dateValue: string) => {
  const dateOnlyTime = getDateOnlyTime(dateValue);

  return dateOnlyTime !== null && dateOnlyTime < getTodayTime();
};
