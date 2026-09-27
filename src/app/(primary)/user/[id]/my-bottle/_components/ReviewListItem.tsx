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
import SemanticIcon from '@/components/ui/Display/SemanticIcon';
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
    reviewModifyAt,
    reviewContent,
    reviewTastingTags,
    isBestReview,
  } = data;

  return (
    <section className="flex items-center border-b border-stroke-neutral-subtle py-16 text-fg-neutral">
      {/* image */}
      <Link href={ROUTES.REVIEW.DETAIL(reviewId)} className="mr-12 shrink-0">
        <ItemImage src={imageUrl} alt="image" />
      </Link>

      {/* info */}
      <Link
        href={ROUTES.REVIEW.DETAIL(reviewId)}
        className="flex flex-col items-start justify-center space-y-6"
      >
        {/* labels */}
        {isHot && (
          <Label
            name={LABEL_NAMES.HOT_5}
            styleClass="mb-4 rounded border-stroke-brand-solid bg-bg-brand-solid px-8 py-[1.6px] text-[8px] text-fg-brand-contrast"
          />
        )}
        {isBestReview && (
          <Label
            name={LABEL_NAMES.BEST}
            icon={
              <SemanticIcon
                src="/icon/thumbup-filled-white.svg"
                width={10}
                height={10}
              />
            }
            styleClass="rounded border-stroke-brand-primary-solid bg-bg-brand-primary-solid px-8 py-[1.6px] text-10 text-fg-brand-contrast"
          />
        )}
        <ItemInfo
          korName={addNewLine(alcoholKorName)}
          engName={alcoholEngName}
          korCategory={korCategoryName}
        />

        {/* review content */}
        <p className="text-12 font-bold text-fg-neutral-muted">
          [{truncStr(reviewContent, 25)}]
        </p>

        {/* flavor tags */}
        {!!reviewTastingTags.length && (
          <div className="flex items-center space-x-6">
            {reviewTastingTags.slice(0, 4).map((tag) => (
              <Label
                key={tag}
                name={tag}
                styleClass="label-default text-10 px-8"
              />
            ))}
            {reviewTastingTags.length > 4 && (
              <Image src={Ellipsis} alt="태그 더보기" />
            )}
          </div>
        )}

        <p className="text-10 text-fg-neutral-muted">
          {format(new Date(reviewModifyAt), 'yyyy.MM.dd')}
        </p>
      </Link>
    </section>
  );
};
