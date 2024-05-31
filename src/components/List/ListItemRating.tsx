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
    isPicked?: boolean;
  };
}

const ListItemRating = ({ data }: Props) => {
  const { korCategory, korName, engName, imageUrl, rating, isPicked } = data;

  return (
    <article className="flex items-center space-x-2 text-mainBlack border-mainBlack border-b h-[90px]">
      <div className="w-[89px] h-[89px] relative flex shrink-0">
        <Image src={imageUrl} alt="위스키 이미지" fill objectFit="cover" />
      </div>

      <section className="flex-1 space-y-1">
        <article className="flex flex-col">
          <h2 className="whitespace-pre text-sm leading-sm font-bold line">
            {korName}
          </h2>
          <p className="text-xxs">
            <span>{engName}</span>
            <span> · {korCategory}</span>
          </p>
        </article>

        <article className="flex justify-between">
          <div>여기에 별점을...</div>
          <div className="space-x-1.5 flex items-center">
            {/* TODO: 유저가 로그인 상태인지 확인하여 조건부 렌더링 */}
            <LikeBtn isLiked={isPicked} />
          </div>
        </article>
      </section>
    </article>
  );
};

export default ListItemRating;
