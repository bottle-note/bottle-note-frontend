import Link from 'next/link';
import ItemImage from '@/components/List/_components/ItemImage';
import ItemInfo from '@/components/List/_components/ItemInfo';
import { addNewLine } from '@/utils/addNewLine';
import { RatingMyBottleListResponse } from '@/types/MyBottle';
import Label from '@/app/(primary)/_components/Label';
import Star from '@/components/Star';
import { ItemStats } from '@/components/List/_components/ItemStats';
import { ROUTES } from '@/constants/routes';

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
    <section className="flex items-center text-mainBlack border-brightGray border-b py-2">
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
            name="HOT 5"
            styleClass="bg-subCoral text-white px-2 py-[0.1rem] border-subCoral text-[8px] rounded mb-1"
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
        {isMyPage && <p className="text-10 text-mainGray font-bold">내 별점</p>}
        <Star
          rating={myRatingPoint}
          size={20}
          color="main"
          textStyle="text-16 text-mainCoral font-black"
        />
      </div>
    </section>
  );
};
