import Link from 'next/link';
import ItemImage from '@/components/feature/List/_components/ItemImage';
import ItemInfo from '@/components/feature/List/_components/ItemInfo';
import { addNewLine } from '@/utils/addNewLine';
import { RatingMyBottleListResponse } from '@/types/MyBottle';
import Label from '@/components/ui/Display/Label';
import Star from '@/components/ui/Display/Star';
import { ItemStats } from '@/components/feature/List/_components/ItemStats';
import { ROUTES } from '@/constants/routes';
import { LABEL_NAMES } from '@/constants/common';

interface Props {
  data: RatingMyBottleListResponse['myBottleList'][number];
  isMyPage: boolean;
}

export const RatingsListItem = ({ data, isMyPage }: Props) => {
  const {
    baseMyBottleInfo: {
      alcoholId,
      imageUrl,
      alcoholKorName,
      alcoholEngName,
      korCategoryName,
      isHot,
    },
    myRatingPoint,
    averageRatingCount,
    averageRatingPoint,
  } = data;

  return (
    <section className="flex items-center border-b border-stroke-neutral-subtle py-2 text-fg-neutral">
      {/* image */}
      <Link href={ROUTES.SEARCH.ALL(alcoholId)}>
        <ItemImage src={imageUrl} alt="image" />
      </Link>

      {/* info */}
      <Link
        href={ROUTES.SEARCH.ALL(alcoholId)}
        className="flex flex-col items-start justify-center space-y-1.5"
      >
        {isHot && (
          <Label
            name={LABEL_NAMES.HOT_5}
            styleClass="mb-1 rounded border-stroke-brand-solid bg-bg-brand-solid px-2 py-[0.1rem] text-[8px] text-fg-brand-contrast"
          />
        )}
        <ItemInfo
          korName={addNewLine(alcoholKorName)}
          engName={alcoholEngName}
          korCategory={korCategoryName}
        />

        <ItemStats
          iconSrc="/icon/star-filled-black.svg"
          pointContent={averageRatingPoint.toFixed(1)}
          countContent={averageRatingCount.toString()}
        />
      </Link>

      {/* my rating point */}
      <div className="ml-auto pr-1 flex flex-col items-end">
        {isMyPage && (
          <p className="text-10 font-bold text-fg-neutral-muted">내 별점</p>
        )}
        <Star
          rating={myRatingPoint}
          size={20}
          textStyle="text-16 text-fg-rating font-black"
        />
      </div>
    </section>
  );
};
