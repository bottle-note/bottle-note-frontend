'use client';

import HorizontalItem from '@/components/HorizontalItem';
import { usePopular } from '@/hooks/usePopular';

function HotList() {
  const { populars } = usePopular();

  return (
    <>
      {populars.length !== 0 && (
        <div className="whitespace-nowrap overflow-x-auto flex space-x-2">
          {populars.map((item) => {
            return (
              <div key={item.alcoholId} className="flex-shrink-0">
                <HorizontalItem data={item} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default HotList;
