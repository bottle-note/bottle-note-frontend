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
    <section className="flex items-center border-b border-stroke-neutral-subtle py-8 text-fg-neutral">
      {/* image */}
      <Link href={ROUTES.SEARCH.ALL(alcoholId)} className="mr-12 shrink-0">
        <ItemImage src={imageUrl} alt="image" />
      </Link>

      {/* info */}
      <Link
        href={ROUTES.SEARCH.ALL(alcoholId)}
        className="flex flex-col items-start justify-center space-y-6"
      >
        {isHot && (
          <Label
            name={LABEL_NAMES.HOT_5}
            styleClass="mb-4 rounded border-stroke-brand-solid bg-bg-brand-solid px-8 py-[1.6px] text-[8px] text-fg-brand-contrast"
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
      <div className="ml-auto pr-4 flex flex-col items-end">
        {isMyPage && (
          <p className="text-10 font-bold text-fg-neutral-muted">내 별점</p>
        )}
        <Star
          rating={myRatingPoint}
          size={20}
          textStyle="text-16 text-fg-brand-primary font-black"
        />
      </div>
    </section>
  );
};
