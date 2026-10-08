import { isAfter, isBefore, isValid, parseISO } from 'date-fns';
import type { Banner } from '@/api/banner/types';

// 배너 API의 시간대 없는 LocalDateTime은 KST 기준이다.
export function filterBannersByDate(
  banners: Banner[],
  now: Date = new Date(),
): Banner[] {
  return banners.filter(({ startDate, endDate }) => {
    const start = startDate ? parseISO(`${startDate}+09:00`) : null;
    const end = endDate ? parseISO(`${endDate}+09:00`) : null;

    return (
      (!start || (isValid(start) && !isBefore(now, start))) &&
      (!end || (isValid(end) && !isAfter(now, end)))
    );
  });
}
