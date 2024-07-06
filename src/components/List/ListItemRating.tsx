'use client';

import Image from 'next/image';
import LikeBtn from '@/app/(primary)/user/[id]/_components/LikeBtn'; // 위치이동!
import StarRating from '../StarRaiting';
import Fallback from 'public/bottle.svg';
import { useState } from 'react';
import { RateAPI } from '@/types/Rate';

interface Props {
  data: RateAPI;
}

const ListItemRating = ({ data }: Props) => {
  const { korCategory, korName, engName, imageUrl, isPicked } = data;
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const [rate, setRate] = useState(0);

  const handleRate = (selectedRate: number) => {
    setRate(selectedRate);
    // TODO: 서버에 별점 업데이트 요청
  };

  return (
    <article className="flex items-center space-x-2 text-mainBlack border-mainBlack border-b h-[90px]">
      <div className="w-[89px] h-[89px] relative flex shrink-0">
        <Image
          src={imgSrc}
          alt="위스키 이미지"
          fill
          className="object-contain w-auto h-auto"
          priority
          sizes="89px"
          onError={() => setImgSrc(Fallback)}
        />
      </div>

      <section className="flex-1 space-y-1">
        <article className="flex flex-col">
          <h2 className="whitespace-pre text-sm leading-sm font-bold line">
            {korName}
          </h2>
          <p className="text-xxs">
            <span>{engName}</span>
            <span> · {korCategory}</span>
          </p>
        </article>

        <article className="flex justify-between">
          <StarRating rate={rate} handleRate={handleRate} />
          <div className="space-x-1.5 flex items-center">
            {/* TODO: 유저가 로그인 상태인지 확인하여 조건부 렌더링 */}
            <LikeBtn isLiked={isPicked} />
          </div>
        </article>
      </section>
    </article>
  );
};

export default ListItemRating;
