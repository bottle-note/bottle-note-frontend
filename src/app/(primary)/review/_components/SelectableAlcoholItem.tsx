'use client';

import { UserRound } from 'lucide-react';
import Star from '@/components/ui/Display/Star';
import type { ExploreAlcohol } from '@/api/explore/types';
import ItemImage from '@/components/feature/List/_components/ItemImage';
import ItemInfo from '@/components/feature/List/_components/ItemInfo';

interface Props {
  data: ExploreAlcohol;
  onSelect: (alcoholId: string) => void;
}

export default function SelectableAlcoholItem({ data, onSelect }: Props) {
  const {
    korName,
    engName,
    alcoholUrlImg,
    rating,
    totalRatingsCount,
    alcoholId,
  } = data;

  const handleClick = () => {
    onSelect(String(alcoholId));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center border-b border-solid border-stroke-neutral-subtle py-4 text-left text-fg-neutral transition-colors hover:bg-bg-layer-default-pressed active:bg-bg-layer-default-pressed"
    >
      <ItemImage src={alcoholUrlImg} alt="image" className="mr-12" />

      <div className="flex flex-col items-start justify-center space-y-6">
        <ItemInfo
          korName={korName}
          engName={engName}
          korCategory={data.korCategory}
        />
      </div>

      <article className="ml-auto pr-4 flex flex-col items-end">
        <Star rating={rating} />
        <p className="flex text-10 mt-6">
          (
          <UserRound
            aria-label="평가 참여자 수"
            className="h-12 w-12 pb-2 text-fg-neutral-muted"
          />
          <span>{totalRatingsCount ?? 0}</span>)
        </p>
      </article>
    </button>
  );
}
