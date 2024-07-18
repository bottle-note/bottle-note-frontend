'use client';

import LikeBtn from '@/app/(primary)/user/[id]/_components/LikeBtn';
import StarRating from '../StarRaiting';
import ItemImage from './_components/ItemImage';
import ItemInfo from './_components/ItemInfo';
import { useState } from 'react';
import { RateAPI } from '@/types/Rate';

interface Props {
  data: RateAPI;
}

const ListItemRating = ({ data }: Props) => {
  const { korCategory, korName, engName, imageUrl, isPicked } = data;
  const [rate, setRate] = useState(0);

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
          <div className="space-x-1.5 flex items-center">
            <LikeBtn isLiked={isPicked} />
          </div>
        </article>
      </section>
    </article>
  );
};

export default ListItemRating;
