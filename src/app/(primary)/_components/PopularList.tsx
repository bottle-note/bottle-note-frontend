'use client';

import PopularCard from '@/app/(primary)/_components/PopularCard';
import { usePopularList } from '@/hooks/usePopularList';

function PopularList() {
  const { popularList } = usePopularList();

  return (
    <>
      {popularList.length !== 0 && (
        <div className="whitespace-nowrap overflow-x-auto overflow-y-hidden flex space-x-2 scrollbar-hide">
          {popularList.map((item) => (
            <div key={item.alcoholId} className="flex-shrink-0 flex-grow-0">
              <PopularCard data={item} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default PopularList;
