import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Star from '@/components/Star';
import PickBtn from '@/app/(primary)/_components/PickBtn';
import { addNewLine } from '@/utils/addNewLine';
import { AlcoholAPI } from '@/types/Alcohol';
import ItemImage from './_components/ItemImage';
import ItemInfo from './_components/ItemInfo';
import RatingCountIcon from 'public/icon/ratingcount-black.svg';
import HasReviewIcon from 'public/icon/edit-filled-subcoral.svg';
import ReviewIcon from 'public/icon/edit-outlined-subcoral.svg';

interface Props {
  data: AlcoholAPI & { hasReviewByMe?: boolean; isMyPage?: boolean };
}

const ListItem = ({ data }: Props) => {
  const {
    korCategoryName,
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
  const [isPicked, setIsPicked] = useState(initialIsPicked);

  return (
    <section className="grid grid-cols-5 text-mainBlack border-brightGray border-b h-[90px]">
      <div className="col-span-4">
        <Link
          href={`/search/all/${alcoholId}`}
          className="flex justify-start items-center h-full"
        >
          <ItemImage src={imageUrl} alt="위스키 이미지" />
          <ItemInfo
            korName={addNewLine(korName)}
            engName={engName}
            korCategory={korCategoryName}
          />
        </Link>
      </div>

      <article className="flex flex-col justify-center">
        <div className="flex flex-col items-end">
          <Star rating={rating} />
          <div
            className={`flex justify-end text-xxs text-right tracking-wider ${!ratingCount && 'hidden'}`}
          >
            (
            <Image src={RatingCountIcon} alt="별점 평가 참여자 수" />
            <span>{`${ratingCount ?? 0}`}</span>)
          </div>

          <div className="flex justify-end mt-1.5 gap-1">
            <Link
              href={
                isMyPage
                  ? `/search/all/${alcoholId}/reviews?name=${korName}`
                  : `/search/all/${alcoholId}/reviews?name=${korName}`
              }
            >
              {hasReviewByMe === true && (
                <Image src={HasReviewIcon} alt="리뷰" />
              )}
              {hasReviewByMe === false && <Image src={ReviewIcon} alt="리뷰" />}
            </Link>
            <PickBtn
              isPicked={isPicked}
              alcoholId={alcoholId}
              iconColor="subcoral"
              handleUpdatePicked={() => setIsPicked(!isPicked)}
              handleError={() => console.error('찜하기 도중 에러 발생')}
              handleNotLogin={() => {}}
            />
          </div>
        </div>
      </article>
    </section>
  );
};

export default ListItem;
