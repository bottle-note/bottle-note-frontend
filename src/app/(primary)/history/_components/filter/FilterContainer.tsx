import React, { FC } from 'react';
import DateRangePicker from '@/components/DateRangePicker';
import ToggleContainer from './ToggleContainer';
import FilterOption from './FilterOption';
import ToggleDarkGrayIcon from 'public/icon/arrow-down-darkgray.svg';

interface Props {
  type?: 'DATA' | 'DATE';
  title: string;
  data?: {
    name: string;
    icon?: FC<{ color?: string; className?: string; size?: number }>;
  }[];
  gridCols?: number;
}

export default function FilterContainer({
  type = 'DATA',
  title,
  data,
  gridCols = 2,
}: Props) {
  if (data?.length === 0) return null;

  const firstItem = data?.[0] ?? '';
  const restItems = data?.slice(1) ?? [];

  const handleDate = (startDate: Date, endDate: Date) => {
    console.log(startDate, endDate);
  };

  return (
    <article>
      <ToggleContainer title={title} toggleIcon={ToggleDarkGrayIcon}>
        {type === 'DATA' ? (
          <div className="py-3 px-5 bg-sectionWhite">
            {firstItem && (
              <div className="mb-1">
                <FilterOption
                  key={0}
                  name={firstItem.name}
                  IconComponent={firstItem?.icon}
                />
              </div>
            )}
            {restItems.length > 0 && (
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                }}
              >
                {restItems.map((item) => (
                  <FilterOption
                    key={item.name}
                    name={item.name}
                    IconComponent={item.icon}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-5 py-3 bg-sectionWhite z-50">
            <DateRangePicker
              startDate={new Date('2025-01-25')}
              endDate={new Date('2025-01-27')}
              onChange={handleDate}
            />
          </div>
        )}
      </ToggleContainer>
    </article>
  );
}
