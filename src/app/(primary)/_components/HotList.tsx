'use client';

import HorizontalItem from '@/components/HorizontalItem';
import { usePopularList } from '@/hooks/usePopularList';

function HotList() {
  const { popularList } = usePopularList();

  return (
    <>
      {popularList.length !== 0 && (
        <div className="whitespace-nowrap overflow-x-auto overflow-y-hidden flex space-x-2 scrollbar-hide">
          {popularList.map((item) => (
            <div key={item.alcoholId} className="flex-shrink-0 flex-grow-0">
              <HorizontalItem data={item} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default HotList;
