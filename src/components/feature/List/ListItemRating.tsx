'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RateApi } from '@/api/rate/rate.api';
import { RateAlcohol } from '@/api/rate/types';
import AlcoholPickButton from '@/components/domain/alcohol/AlcoholPickButton';
import useModalStore from '@/store/modalStore';
import { useAuth } from '@/hooks/auth/useAuth';
import { ROUTES } from '@/constants/routes';
import StarRating from '@/components/ui/Form/StarRating';
import ItemImage from './_components/ItemImage';
import ItemInfo from './_components/ItemInfo';

interface Props {
  data: RateAlcohol;
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
  const { isLoggedIn } = useAuth();
  const [rate, setRate] = useState(0);
  const [isPicked, setIsPicked] = useState(initialIsPicked);
  const { handleLoginModal } = useModalStore();

  const handleRate = async (selectedRate: number) => {
    if (!isLoggedIn) return handleLoginModal();
    setRate(selectedRate);
    await RateApi.postRating({
      alcoholId: String(alcoholId),
      rating: selectedRate,
    });
  };

  return (
    <article className="flex items-center space-x-2 text-mainBlack border-brightGray border-b h-[90px]">
      <Link href={ROUTES.SEARCH.ALL(alcoholId)}>
        <ItemImage src={imageUrl} alt="image" />
      </Link>

      <section className="flex-1 space-y-1">
        <Link
          href={ROUTES.SEARCH.ALL(alcoholId)}
          className="flex flex-col items-start justify-center space-y-1.5"
        >
          <ItemInfo
            korName={korName}
            engName={engName}
            korCategory={korCategory}
          />
        </Link>

        <article className="flex justify-between">
          <StarRating
            rate={rate}
            handleRate={handleRate}
            outerHeightSize={36}
            outerWidthSize={34}
          />
          <div className="space-x-1.5 flex items-end">
            <AlcoholPickButton
              isPicked={isPicked}
              alcoholId={alcoholId}
              iconColor="subcoral"
              handleUpdatePicked={() => setIsPicked((prev) => !prev)}
              onApiError={() => setIsPicked(initialIsPicked)}
              handleNotLogin={handleLoginModal}
            />
          </div>
        </article>
      </section>
    </article>
  );
};

export default ListItemRating;
