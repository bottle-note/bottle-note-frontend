'use client';

import Image from 'next/image';
import PopularCard from '@/app/(primary)/_components/PopularCard';
import { usePopularList } from '@/hooks/usePopularList';

type ListType = 'week' | 'spring' | 'recent';

interface Props {
  type?: ListType;
}

const EmptyState = ({ type }: { type: ListType }) => {
  const emptyStateContent = {
    week: {
      text: '이번 주 인기 위스키가 없어요.',
    },
    spring: {
      text: '봄 추천 위스키가 없어요.',
    },
    recent: {
      text: '최근에 본 위스키가 없어요.',
    },
  };

  const content = emptyStateContent[type];

  return (
    <div className="flex flex-col items-center justify-center">
      <Image src="/icon/logo-subcoral.svg" alt="logo" width={30} height={30} />
      <p className="text-mainGray text-15 mt-5">{content.text}</p>
    </div>
  );
};

const Description = ({ type }: { type: ListType }) => {
  switch (type) {
    case 'week':
      return (
        <>
          <p className="pb-[10px] text-13 font-extrabold text-mainCoral">
            WEEKLY HOT 5
          </p>
          <div className="text-20 font-bold space-y-[2px] pb-5">
            <p>이번 주 사람들이 가장 많이 검색한</p>
            <p>HOT5를 확인해보세요🔥</p>
          </div>
        </>
      );
    case 'spring':
      return (
        <>
          <p className="pb-[10px] text-13 font-extrabold text-mainCoral">
            SPRING PICKS
          </p>
          <div className="text-20 font-bold space-y-[2px] pb-5">
            <p>봄에 어울리는 술</p>
            <p>봄바람처럼 부드러운 한 잔🌸</p>
          </div>
        </>
      );
    // case 'recent':
    //   return (
    //     <p className="pb-[10px] text-13 font-extrabold text-mainCoral">
    //       VIEWED WHISKIES
    //     </p>
    //   );
    default:
      return null;
  }
};

function PopularList({ type = 'week' }: Props) {
  const { popularList, isLoading } = usePopularList({ type });

  if (isLoading) {
    return <div className="pt-[34px] pl-[25px]">로딩중...</div>;
  }

  return (
    <div className="pt-[34px] pl-[25px]">
      <Description type={type} />
      {popularList.length !== 0 ? (
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
      ) : (
        <EmptyState type={type} />
      )}
    </div>
  );
}

export default PopularList;
