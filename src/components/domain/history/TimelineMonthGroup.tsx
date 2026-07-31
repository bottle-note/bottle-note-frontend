import React from 'react';
import Label from '@/components/ui/Display/Label';
import TimeLineItem from '@/components/domain/history/TimeLineItem';
import { shouldShowDivider } from '@/app/(primary)/history/utils/historyUtils';
import { History as HistoryType } from '@/types/History';

interface TimelineMonthGroupProps {
  yearMonth: string;
  items: HistoryType[];
  isFirstGroup?: boolean;
  isLastGroup?: boolean;
}

export default function TimelineMonthGroup({
  yearMonth,
  items,
  isFirstGroup = false,
  isLastGroup = false,
}: TimelineMonthGroupProps) {
  return (
    <div className="relative">
      {!isFirstGroup && (
        <div className="pl-4 mb-5">
          <Label
            name={yearMonth}
            styleClass="rounded-md border-stroke-neutral-subtle bg-bg-neutral-weak px-2.5 py-1 text-11 text-fg-brand"
          />
        </div>
      )}
      <div className="z-10 space-y-5">
        {items.map((item: HistoryType, itemIndex) => {
          const prevItem = itemIndex > 0 ? items[itemIndex - 1] : null;
          const showDivider = shouldShowDivider(item, prevItem);
          return (
            <React.Fragment key={item.historyId}>
              {showDivider && (
                <div className="relative py-1">
                  <div className="absolute left-0 right-0 h-px bg-stroke-neutral-subtle" />
                </div>
              )}
              <TimeLineItem
                date={item.createdAt}
                alcoholName={item.alcoholName}
                imageSrc={item.imageUrl}
                type={item.eventType}
                rate={item.dynamicMessage}
                content={item.content}
                redirectUrl={item.redirectUrl}
              />
            </React.Fragment>
          );
        })}
      </div>
      {!isLastGroup && <div className="my-5" />}
    </div>
  );
}
