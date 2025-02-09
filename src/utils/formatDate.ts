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
