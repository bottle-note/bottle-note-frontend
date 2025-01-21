import { useMemo } from 'react';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import TimeLineItem from '@/app/(primary)/_components/TimeLineItem';
import Label from '@/app/(primary)/_components/Label';
import { HistoryApi } from '@/types/History';
import { formatDate } from '@/utils/formatDate';

import { HISTORY_MOCK_LIST_ITEM } from '../../../../../../mock/history';

function Timeline() {
  const groupHistoryByDate = (historyItems: HistoryApi[]) => {
    const sortedItems = [...historyItems].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const groupedItems = sortedItems.reduce(
      (acc, item) => {
        const yearMonth = formatDate(item.createdAt, 'YEAR_MONTH') as string;

        if (!acc[yearMonth]) {
          acc[yearMonth] = [];
        }
        acc[yearMonth].push(item);
        return acc;
      },
      {} as Record<string, HistoryApi[]>,
    );

    return groupedItems;
  };

  const groupedHistory = groupHistoryByDate(HISTORY_MOCK_LIST_ITEM);

  const gradientHeight = useMemo(() => {
    return HISTORY_MOCK_LIST_ITEM.length <= 3 ? '150px' : '400px';
  }, [HISTORY_MOCK_LIST_ITEM]);

  if (Object.keys(groupedHistory).length === 0) {
    return (
      <section>
        <article className="py-5 border-y border-mainGray/30">
          <EmptyView text="히스토리가 없어요!" />
        </article>
      </section>
    );
  }

  return (
    <section>
      <article>
        <div className="font-semibold">
          <p className="text-15 text-subCoral">나의 보틀 여정 히스토리</p>
          <p className="text-10 text-brightGray">
            별점, 평가,찜하기 활동내역을 살펴볼 수 있어요.
          </p>
        </div>
        <div className="border-t border-mainGray/30 my-3" />
        <div className="relative">
          <div className="absolute left-[2.7rem] top-6 bottom-0 w-px border-l border-dashed border-subCoral z-0" />
          <div className="relative z-10 pb-3">
            {Object.entries(groupedHistory).map(([yearMonth, items], index) => (
              <div key={yearMonth} className="relative">
                <div className="pl-4 mb-5">
                  <Label
                    name={yearMonth}
                    styleClass="border-white px-2.5 py-1 rounded-md text-11 bg-bgGray text-subCoral"
                  />
                </div>
                <div className="z-10 space-y-5">
                  {items.map((item: HistoryApi) => (
                    <TimeLineItem
                      key={item.historyId}
                      date={item.createdAt}
                      alcoholName={item.korName}
                      imageSrc={item.imageUrl}
                      type={item.eventCategory}
                      rating={item?.rating}
                      text={item?.reviewText}
                    />
                  ))}
                </div>
                {index !== Object.keys(groupedHistory).length - 1 && (
                  <div className="my-5" />
                )}
              </div>
            ))}
          </div>

          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-none z-10"
            style={{
              height: gradientHeight,
              background:
                'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
            }}
          />
        </div>
        <div className="mb-2" />
      </article>
    </section>
  );
}

export default Timeline;
