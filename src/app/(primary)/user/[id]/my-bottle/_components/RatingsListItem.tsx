import Image from 'next/image';
import ItemImage from '@/components/List/_components/ItemImage';
import ItemInfo from '@/components/List/_components/ItemInfo';
import { addNewLine } from '@/utils/addNewLine';
import { RatingMyBottleListResponse } from '@/types/MyBottle';
import { ItemLink } from '@/components/List/_components/ItemLink';
import Label from '@/app/(primary)/_components/Label';
import Star from '@/components/Star';
import RatingCountIcon from 'public/icon/rating-count-black.svg';
import StartIcon from 'public/icon/star-filled-black.svg';

interface Props {
  data: RatingMyBottleListResponse['myBottleList'][number];
}

export const RatingsListItem = ({ data }: Props) => {
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
    <section className="text-mainBlack border-brightGray border-b py-2 flex items-center">
      {/* image */}
      <ItemLink alcoholId={alcoholId} className="">
        <ItemImage src={imageUrl} alt="image" />
      </ItemLink>

      {/* info */}
      <ItemLink
        alcoholId={alcoholId}
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

        <div className="flex justify-end text-12 font-semibold gap-[1px]">
          <Image src={StartIcon} alt="평균 별점" className="pb-[3px]" />
          <span>{`${averageRatingPoint.toFixed(1)}`}</span>
          <p className="flex">
            (
            <>
              <Image
                src={RatingCountIcon}
                alt="별점 평가 참여자 수"
                className="pb-[2px]"
              />
              <span>{`${averageRatingCount}`}</span>
            </>
            )
          </p>
        </div>
      </ItemLink>

      {/* my rating point */}
      <div className="ml-auto pr-1 flex flex-col items-end">
        <p className="text-10 text-mainGray font-bold">내 별점</p>
        <Star
          rating={myRatingPoint}
          size={20}
          color="main"
          styleProps="text-16 text-mainCoral font-black"
        />
      </div>
    </section>
  );
};
