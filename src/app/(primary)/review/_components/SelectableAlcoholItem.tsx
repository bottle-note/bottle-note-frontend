'use client';

import Image from 'next/image';
import Star from '@/components/ui/Display/Star';
import { AlcoholAPI } from '@/types/Alcohol';
import ItemImage from '@/components/feature/List/_components/ItemImage';
import ItemInfo from '@/components/feature/List/_components/ItemInfo';
import RatingCountIcon from 'public/icon/rating-count-black.svg';

interface Props {
  data: AlcoholAPI;
  onSelect: (alcoholId: string) => void;
}

export default function SelectableAlcoholItem({ data, onSelect }: Props) {
  const {
    korCategory,
    korName,
    engName,
    imageUrl,
    rating,
    ratingCount,
    alcoholId,
  } = data;

  const handleClick = () => {
    onSelect(String(alcoholId));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center text-mainBlack border-brightGray border-b border-solid py-1 w-full text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
    >
      <ItemImage src={imageUrl} alt="image" />

      <div className="flex flex-col items-start justify-center space-y-1.5">
        <ItemInfo
          korName={korName}
          engName={engName}
          korCategory={korCategory}
        />
      </div>

      <article className="ml-auto pr-1 flex flex-col items-end">
        <Star rating={rating} />
        <p className="flex text-10 mt-1.5">
          (
          <Image
            src={RatingCountIcon}
            alt="평가 참여자 수"
            className="pb-[2px]"
          />
          <span>{ratingCount ?? 0}</span>)
        </p>
      </article>
    </button>
  );
}
