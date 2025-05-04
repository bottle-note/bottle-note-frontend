import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Star from '@/components/Star';
import PickBtn from '@/app/(primary)/_components/PickBtn';
import { addNewLine } from '@/utils/addNewLine';
import { AlcoholAPI } from '@/types/Alcohol';
import useModalStore from '@/store/modalStore';
import ItemImage from './_components/ItemImage';
import ItemInfo from './_components/ItemInfo';
import RatingCountIcon from 'public/icon/rating-count-black.svg';
import HasReviewIcon from 'public/icon/edit-filled-subcoral.svg';
import ReviewIcon from 'public/icon/edit-outlined-subcoral.svg';

interface Props {
  data: AlcoholAPI & { hasReviewByMe?: boolean; isMyPage?: boolean };
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
      <Link href={`/search/all/${alcoholId}`}>
        <ItemImage src={imageUrl} alt="image" />
      </Link>

      {/* info */}
      <Link
        href={`/search/all/${alcoholId}`}
        className="flex flex-col items-start justify-center space-y-1.5"
      >
        <ItemInfo
          korName={addNewLine(korName)}
          engName={engName}
          korCategory={korCategory}
        />
      </Link>

      <article className="ml-auto  pr-1 flex flex-col items-end">
        {/* rating */}
        <Star rating={rating} />
        {/* count */}
        <p className="flex text-10 gap-[1px]">
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
          <Link
            href={
              isMyPage
                ? `/search/all/${alcoholId}/reviews?name=${korName}`
                : `/search/all/${alcoholId}/reviews?name=${korName}`
            }
          >
            {hasReviewByMe === true && <Image src={HasReviewIcon} alt="리뷰" />}
            {hasReviewByMe === false && <Image src={ReviewIcon} alt="리뷰" />}
          </Link>
          <PickBtn
            isPicked={isPicked}
            alcoholId={alcoholId}
            iconColor="subcoral"
            handleUpdatePicked={() => setIsPicked(!isPicked)}
            handleError={() => console.error('찜하기 도중 에러 발생')}
            handleNotLogin={handleLoginModal}
          />
        </div>
      </article>
    </section>
  );
};

export default ListItem;
