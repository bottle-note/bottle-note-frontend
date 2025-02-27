import { formatDate } from '@/utils/formatDate';
import { History } from '@/types/History';

interface GroupHistoryOptions {
  limit?: number;
  shouldLimit?: boolean;
}

export const groupHistoryByDate = (
  historyItems: History[],
  options: GroupHistoryOptions = {},
) => {
  const { limit = 7, shouldLimit = false } = options;

  const itemsToProcess = shouldLimit
    ? historyItems.slice(0, limit)
    : historyItems;

  const sortedItems = [...itemsToProcess].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const groupedItems = sortedItems.reduce(
    (acc, item) => {
      const yearMonth = formatDate(item.createdAt, 'YEAR_MONTH') as string;

      const newAcc = { ...acc };
      if (!newAcc[yearMonth]) {
        newAcc[yearMonth] = [];
      }
      newAcc[yearMonth].push(item);
      return newAcc;
    },
    {} as Record<string, History[]>,
  );

  return groupedItems;
};

export function shouldShowDivider(
  currentItem: History,
  prevItem: History | null,
) {
  if (!prevItem) return false;
  const prevDate = prevItem.createdAt.slice(0, 10);
  const currentDate = currentItem.createdAt.slice(0, 10);

  const prevYearMonth = prevDate.slice(0, 7);
  const currentYearMonth = currentDate.slice(0, 7);

  const prevDay = prevDate.slice(8, 10);
  const currentDay = currentDate.slice(8, 10);

  return prevYearMonth === currentYearMonth && prevDay !== currentDay;
}
