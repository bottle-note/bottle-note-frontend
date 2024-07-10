'use client';

import Star from '@/components/Star';
import { truncStr } from '@/utils/truncStr';
import LikeBtn from '@/app/(primary)/user/[id]/_components/LikeBtn';
import Review from '@/app/(primary)/user/[id]/_components/ReviewBtn';
import { addNewLine } from '@/utils/addNewLine';
import ItemImage from './_components/ItemImage';
import ItemInfo from './_components/ItemInfo';

interface Props {
  data: {
    alcoholId: number;
    korName: string;
    engName: string;
    rating: number;
    engCategory: string;
    korCategory: string;
    imageUrl: string;
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
      <ItemImage src={imageUrl} alt="위스키 이미지" />
      <section className="flex-1 space-y-1">
        <ItemInfo
          korName={addNewLine(korName)}
          engName={truncStr(engName, 16)}
          korCategory={korCategory}
        />
        <article className="flex justify-between">
          <div className="flex flex-col">
            <Star rating={rating} />
            {review_count && (
              <span className="text-[0.625rem] justify-self-end row-start-2 text-right">
                {`${review_count}`}
              </span>
            )}
          </div>
          <div className="space-x-1.5 flex items-center">
            {isReviewed && <Review />}
            <LikeBtn isLiked={isLiked} />
          </div>
        </article>
      </section>
    </article>
  );
};

export default ListItem;
