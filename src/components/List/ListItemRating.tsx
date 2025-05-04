'use client';

import { useState } from 'react';
import { RateAPI } from '@/types/Rate';
import PickBtn from '@/app/(primary)/_components/PickBtn';
import { RateApi } from '@/app/api/RateApi';
import useModalStore from '@/store/modalStore';
import { AuthService } from '@/lib/AuthService';
import ItemImage from './_components/ItemImage';
import ItemInfo from './_components/ItemInfo';
import { ItemLink } from './_components/ItemLink';
import StarRating from '../StarRaiting';

interface Props {
  data: RateAPI;
}

const ListItemRating = ({ data }: Props) => {
  const {
    korCategoryName,
    korName,
    engName,
    imageUrl,
    isPicked: initialIsPicked,
    alcoholId,
  } = data;
  const { isLogin } = AuthService;
  const [rate, setRate] = useState(0);
  const [isPicked, setIsPicked] = useState(initialIsPicked);
  const { handleLoginModal } = useModalStore();

  const handleRate = async (selectedRate: number) => {
    if (!isLogin) return handleLoginModal();
    setRate(selectedRate);
    await RateApi.postRating({
      alcoholId: String(alcoholId),
      rating: selectedRate,
    });
  };

  return (
    <article className="flex items-center space-x-2 text-mainBlack border-brightGray border-b h-[90px]">
      <ItemLink alcoholId={alcoholId}>
        <ItemImage src={imageUrl} alt="image" />
      </ItemLink>

      <section className="flex-1 space-y-1">
        <ItemLink alcoholId={alcoholId}>
          <ItemInfo
            korName={korName}
            engName={engName}
            korCategory={korCategoryName}
          />
        </ItemLink>

        <article className="flex justify-between">
          <StarRating
            rate={rate}
            handleRate={handleRate}
            outerHeightSize={36}
            outerWidthSize={34}
          />
          <div className="space-x-1.5 flex items-end">
            <PickBtn
              isPicked={isPicked}
              alcoholId={alcoholId}
              iconColor="subcoral"
              handleUpdatePicked={() => setIsPicked(!isPicked)}
              handleError={() => alert('에러가 발생했습니다.')}
              handleNotLogin={handleLoginModal}
            />
          </div>
        </article>
      </section>
    </article>
  );
};

export default ListItemRating;
