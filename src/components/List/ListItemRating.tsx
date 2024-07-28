'use client';

import { useState } from 'react';
import { RateAPI } from '@/types/Rate';
import PickBtn from '@/app/(primary)/_components/PickBtn';
import ItemInfo from './_components/ItemInfo';
import ItemImage from './_components/ItemImage';
import StarRating from '../StarRaiting';

interface Props {
  data: RateAPI;
}

const ListItemRating = ({ data }: Props) => {
  const {
    korCategory,
    korName,
    engName,
    imageUrl,
    isPicked: initialIsPicked,
    alcoholId,
  } = data;
  const [rate, setRate] = useState(0);
  const [isPicked, setIsPicked] = useState(initialIsPicked);

  const handleRate = (selectedRate: number) => {
    setRate(selectedRate);
    // TODO: 서버에 별점 업데이트 요청
  };

  return (
    <article className="flex items-center space-x-2 text-mainBlack border-brightGray border-b h-[90px]">
      <ItemImage src={imageUrl} alt="위스키 이미지" />
      <section className="flex-1 space-y-1">
        <ItemInfo
          korName={korName}
          engName={engName}
          korCategory={korCategory}
        />
        <article className="flex justify-between">
          <StarRating rate={rate} handleRate={handleRate} />
          <div className="space-x-1.5 flex items-end">
            <PickBtn
              isPicked={isPicked}
              alcoholId={alcoholId}
              iconColor="subcoral"
              // FIXME: 별도 함수로 분리
              handleUpdatePicked={() => setIsPicked(!isPicked)}
              handleError={() => alert('에러가 발생했습니다.')}
              handleNotLogin={() => alert('로그인이 필요한 서비스입니다.')}
            />
          </div>
        </article>
      </section>
    </article>
  );
};

export default ListItemRating;
