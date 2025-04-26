'use client';

import PopularCard from '@/app/(primary)/_components/PopularCard';
import { usePopularList } from '@/hooks/usePopularList';

function PopularList() {
  const { popularList } = usePopularList();

  return (
    <div className="pt-[34px] pl-[25px]">
      <p className="pb-[10px] text-13 font-extrabold text-mainCoral">
        WEEKLY HOT 5
      </p>
      <div className="text-20 font-bold space-y-[2px] pb-5">
        <p>이번 주 사람들이 가장 많이 검색한</p>
        <p>HOT5 를 확인해보세요🔥</p>
      </div>
      {popularList.length !== 0 && (
        <div className="whitespace-nowrap overflow-x-auto overflow-y-hidden flex space-x-2 scrollbar-hide">
          {popularList.map((item, index) => (
            <div
              key={item.alcoholId}
              className={`flex-shrink-0 flex-grow-0 rounded-lg ${
                index === popularList.length - 1 ? 'pr-[25px]' : ''
              }`}
            >
              <PopularCard data={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PopularList;
