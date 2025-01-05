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

interface Props {
  data: AlcoholAPI;
}

const ListItem = ({ data }: Props) => {
  const {
    korCategoryName,
    engCategory,
    korName,
    engName,
    imageUrl,
    rating,
    isPicked: initialIsPicked,
    ratingCount,
    alcoholId,
  } = data;
  const [isPicked, setIsPicked] = useState(initialIsPicked);

  return (
    <section className="grid grid-cols-2 text-mainBlack border-brightGray border-b h-[90px]">
      <Link
        href={`/search/${engCategory}/${alcoholId}`}
        className="grid grid-cols-2"
      >
        <ItemImage src={imageUrl} alt="위스키 이미지" />
        <article className="flex w-full justify-between items-center">
          <ItemInfo
            korName={addNewLine(korName)}
            engName={engName}
            korCategory={korCategoryName}
          />
        </article>
      </Link>

      <article className="flex flex-col justify-center">
        <div className="">
          <Star rating={rating} />
        </div>

        <div
          className={`flex justify-end text-xxs text-right tracking-wider ${!ratingCount && 'hidden'}`}
        >
          (
          <Image src={RatingCountIcon} alt="별점 평가 참여자 수" />
          <span className="">{`${ratingCount ?? 0}`}</span>)
        </div>

        <div className="flex justify-end mt-1.5">
          <PickBtn
            isPicked={isPicked}
            alcoholId={alcoholId}
            iconColor="subcoral"
            handleUpdatePicked={() => setIsPicked(!isPicked)}
            handleError={() => console.error('찜하기 도중 에러 발생')}
            handleNotLogin={() => {}}
          />
        </div>
      </article>
    </section>
  );
};

export default ListItem;
