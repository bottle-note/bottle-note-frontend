import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Star from '@/components/ui/Display/Star';
import AlcoholPickButton from '@/components/domain/alcohol/AlcoholPickButton';
import { Alcohol } from '@/api/alcohol/types';
import useModalStore from '@/store/modalStore';
import { ROUTES } from '@/constants/routes';
import ItemImage from './_components/ItemImage';
import ItemInfo from './_components/ItemInfo';
import RatingCountIcon from 'public/icon/rating-count-black.svg';

interface Props {
  data: Alcohol & { hasReviewByMe?: boolean; isMyPage?: boolean };
}

const ListItem = ({ data }: Props) => {
  const {
    korCategory,
    korName,
    engName,
    imageUrl,
    rating,
    isPicked: initialIsPicked,
    ratingCount,
    alcoholId,
    hasReviewByMe,
    isMyPage,
  } = data;
  const { handleLoginModal } = useModalStore();
  const [isPicked, setIsPicked] = useState(initialIsPicked);

  return (
    <section className="flex items-center text-mainBlack border-brightGray border-b py-1">
      {/* image */}
      <Link href={ROUTES.SEARCH.ALL(alcoholId)}>
        <ItemImage src={imageUrl} alt="image" />
      </Link>

      {/* info */}
      <Link
        href={ROUTES.SEARCH.ALL(alcoholId)}
        className="flex-1 flex flex-col items-start justify-center space-y-1.5 pr-2"
      >
        <ItemInfo
          korName={korName}
          engName={engName}
          korCategory={korCategory}
        />
      </Link>

      <article className="ml-auto  pr-1 flex flex-col items-end">
        {/* rating */}
        <Star rating={rating} />
        {/* count */}
        <p className="flex text-10 mt-1.5">
          (
          <>
            <Image
              src={RatingCountIcon}
              alt="평가 참여자 수"
              className="pb-[2px]"
            />
            <span>{ratingCount ?? 0}</span>
          </>
          )
        </p>

        <div className="flex justify-end mt-3">
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
  );
};

export default ListItem;
