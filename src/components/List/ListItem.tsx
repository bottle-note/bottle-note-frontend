import Star from '@/components/Star';
import { truncStr } from '@/utils/truncStr';
import PickBtn from '@/app/(primary)/_components/PickBtn';
import { addNewLine } from '@/utils/addNewLine';
import ItemImage from './_components/ItemImage';
import ItemInfo from './_components/ItemInfo';
import { AlcoholAPI } from '@/types/Alcohol';
import Link from 'next/link';
import { useState } from 'react';
import RatingCountIcon from 'public/icon/ratingcount-black.svg';
import Image from 'next/image';

interface Props {
  data: AlcoholAPI;
}

const ListItem = ({ data }: Props) => {
  const {
    korCategory,
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
    <Link href={`/search/${engCategory}/${alcoholId}`}>
      <article className="flex items-center space-x-1 text-mainBlack border-mainBlack border-b h-[90px]">
        <ItemImage src={imageUrl} alt="위스키 이미지" />
        <section className="flex w-full justify-between items-center">
          <ItemInfo
            korName={addNewLine(korName)}
            engName={truncStr(engName, 16)}
            korCategory={korCategory}
          />

          <article className="flex flex-col">
            <div className="">
              <Star rating={rating} />
            </div>

            <div
              className={`flex justify-end text-xxs text-right tracking-wider ${ratingCount === undefined ? 'visible' : 'invisible'}`}
            >
              (
              <Image src={RatingCountIcon} alt="별점 평가 참여자 수" />
              <span className="">{`${ratingCount ?? 0}`}</span>)
            </div>

            <div className="flex justify-end mt-1.5">
              <PickBtn
                isPicked={isPicked}
                setIsPicked={setIsPicked}
                alcoholId={alcoholId}
                iconColor="subcoral"
              />
            </div>
          </article>
        </section>
      </article>
    </Link>
  );
};

export default ListItem;
