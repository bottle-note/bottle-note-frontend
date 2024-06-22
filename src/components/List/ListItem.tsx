'use client';

import Image from 'next/image';
import Star from '@/components/Star';
import { truncStr } from '@/utils/truncStr';
import LikeBtn from '@/app/(primary)/user/[id]/_components/LikeBtn'; // 위치이동!
import Review from '@/app/(primary)/user/[id]/_components/ReviewBtn';
import { addNewLine } from '@/utils/addNewLine';

interface Props {
  data: {
    alcoholId: number;
    korName: string;
    engName: string;
    rating: number;
    engCategory: string;
    korCategory: string;
    imageUrl: string;
    // TODO: api dto 논의를 통해 아래 조건들도 옵셔널로 필요
    isLiked?: boolean;
    isReviewed?: boolean;
    review_count?: number;
  };
}

const ListItem = ({ data }: Props) => {
  const {
    korCategory,
    korName,
    engName,
    imageUrl,
    rating,
    isLiked,
    isReviewed,
    review_count,
  } = data;

  return (
    <article className="flex items-center space-x-2 text-mainBlack border-mainBlack border-b h-[90px]">
      <div className="w-[89px] h-[89px] relative flex shrink-0">
        <Image src={imageUrl} alt="위스키 이미지" fill objectFit="contain" />
      </div>

      <section className="flex-1 space-y-1">
        <article className="flex justify-between items-center ">
          <h2 className="whitespace-pre text-sm leading-sm font-bold line">
            {addNewLine(korName)}
          </h2>
          <div className="flex flex-col">
            {/* rating이 null 혹은 0인 경우 invisible */}
            <Star rating={rating} />
            {review_count && (
              <span className="text-[0.625rem] justify-self-end row-start-2 text-right">
                {`${review_count}`}
              </span>
            )}
          </div>
        </article>

        <article className="flex justify-between">
          <p className="text-xxs">
            <span>{truncStr(engName, 16)}</span>
            <span> · {korCategory}</span>
          </p>
          <div className="space-x-1.5 flex items-center">
            {isReviewed && <Review />}
            {/* TODO: 유저가 로그인 상태인지 확인하여 조건부 렌더링 */}
            <LikeBtn isLiked={isLiked} />
          </div>
        </article>
      </section>
    </article>
  );
};

export default ListItem;
