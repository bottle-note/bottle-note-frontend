import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Star from '@/components/Star';
import { truncStr } from '@/utils/truncStr';
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
                alcoholId={alcoholId}
                iconColor="subcoral"
                // FIXME: 별도 함수로 분리
                handleUpdatePicked={() => setIsPicked(!isPicked)}
                handleError={() => alert('에러가 발생했습니다.')}
                handleNotLogin={() => alert('로그인이 필요한 서비스입니다.')}
              />
            </div>
          </article>
        </section>
      </article>
    </Link>
  );
};

export default ListItem;
