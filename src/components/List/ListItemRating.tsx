'use client';

import StarRating from '../StarRaiting';
import ItemImage from './_components/ItemImage';
import ItemInfo from './_components/ItemInfo';
import { useState } from 'react';
import { RateAPI } from '@/types/Rate';
import PickBtn from '@/app/(primary)/_components/PickBtn';

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
              setIsPicked={setIsPicked}
              alcoholId={alcoholId}
              iconColor="subcoral"
            />
          </div>
        </article>
      </section>
    </article>
  );
};

export default ListItemRating;
