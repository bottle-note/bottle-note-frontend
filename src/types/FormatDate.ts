export type DateFormat = 'FULL_DATE' | 'YEAR_MONTH' | 'MONTH_DATE_TIME';

export interface TimeFormat {
  date: string;
  time?: string;
}
