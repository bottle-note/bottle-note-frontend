import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import Label from '@/components/ui/Display/Label';
import ItemImage from '@/components/feature/List/_components/ItemImage';
import ItemInfo from '@/components/feature/List/_components/ItemInfo';
import { ReviewMyBottleListResponse } from '@/types/MyBottle';
import { addNewLine } from '@/utils/addNewLine';
import { truncStr } from '@/utils/truncStr';
import { ROUTES } from '@/constants/routes';
import { LABEL_NAMES } from '@/constants/common';
import Ellipsis from 'public/icon/ellipsis-vertical-subcoral.svg';

interface Props {
  data: ReviewMyBottleListResponse['myBottleList'][number];
}

export const ReviewListItem = ({ data }: Props) => {
  const {
    baseMyBottleInfo: {
      imageUrl,
      alcoholKorName,
      alcoholEngName,
      korCategoryName,
      isHot,
    },
    reviewId,
    isMyReview,
    reviewModifyAt,
    reviewContent,
    reviewTastingTags,
    isBestReview,
  } = data;

  return (
    <section className="text-mainBlack border-brightGray border-b py-4 flex items-center">
      {/* image */}
      <Link href={ROUTES.REVIEW.DETAIL(reviewId)}>
        <ItemImage src={imageUrl} alt="image" />
      </Link>

      {/* info */}
      <Link
        href={ROUTES.REVIEW.DETAIL(reviewId)}
        className="flex flex-col items-start justify-center space-y-1.5"
      >
        {/* labels */}
        {isHot && (
          <Label
            name={LABEL_NAMES.HOT_5}
            styleClass="bg-subCoral text-white px-2 py-[0.1rem] border-subCoral text-[8px] rounded mb-1"
          />
        )}
        {isBestReview && (
          <Label
            name={LABEL_NAMES.BEST}
            icon="/icon/thumbup-filled-white.svg"
            styleClass="bg-mainCoral text-white px-2 py-[0.1rem] text-10 border-mainCoral rounded"
          />
        )}
        <ItemInfo
          korName={addNewLine(alcoholKorName)}
          engName={alcoholEngName}
          korCategory={korCategoryName}
        />

        {/* review content */}
        <p className="text-12 font-bold">[{truncStr(reviewContent, 25)}]</p>

        {/* flavor tags */}
        {!!reviewTastingTags.length && (
          <div className="flex items-center space-x-1.5">
            {reviewTastingTags.slice(0, 4).map((tag) => (
              <Label
                key={tag}
                name={tag}
                styleClass="label-default text-10 px-2"
              />
            ))}
            {reviewTastingTags.length > 4 && (
              <Image src={Ellipsis} alt="태그 더보기" />
            )}
          </div>
        )}

        <p className="text-10 text-mainGray">
          {format(new Date(reviewModifyAt), 'yyyy.dd.MM')}
        </p>
      </Link>
    </section>
  );
};
