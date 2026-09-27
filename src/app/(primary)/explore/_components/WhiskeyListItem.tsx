import { memo } from 'react';
import Link from 'next/link';
import { Star as StarIcon, UserRound } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { LABEL_NAMES } from '@/constants/common';
import { ExploreAlcohol } from '@/types/Explore';
import ItemImage from '@/components/feature/List/_components/ItemImage';
import ItemInfo from '@/components/feature/List/_components/ItemInfo';
import Star from '@/components/ui/Display/Star';
import Label from '@/components/ui/Display/Label';

interface Props {
  content: ExploreAlcohol;
  priority?: boolean;
  onClick?: () => void;
}

const WhiskeyListItem = ({ content, priority = false, onClick }: Props) => {
  const abv =
    typeof content.abv === 'string'
      ? content.abv.replace(/(?:\s*%\s*)+$/, '')
      : content.abv;
  const tastingTags = [...new Set(content.alcoholsTastingTags ?? [])];

  return (
    <section className="flex w-full items-center overflow-hidden py-24 text-fg-neutral gap-12">
      {/* image */}
      <Link
        href={ROUTES.SEARCH.ALL(content.alcoholId)}
        className="shrink-0"
        onClick={onClick}
      >
        <ItemImage
          src={content.alcoholUrlImg}
          alt="image"
          className="w-95 h-128 bg-palette-static-white rounded-sm"
          priority={priority}
        />
      </Link>

      {/* info */}
      <Link
        href={ROUTES.SEARCH.ALL(content.alcoholId)}
        className="flex min-w-0 flex-1 flex-col items-start justify-center space-y-8"
        onClick={onClick}
      >
        <div className="min-w-0 space-y-8">
          <ItemInfo
            korName={content.korName}
            engName={content.engName}
            length={50}
          />
          <p className="text-13 text-fg-neutral-muted">{`도수 ${abv}% · ${content.korCategory}`}</p>
        </div>

        {/* 별점 */}
        <div className="flex items-center gap-x-4">
          <Label
            name={LABEL_NAMES.MY_RATING}
            styleClass="label-default text-12 px-8 py-1 rounded-[2px] flex items-end"
            position="after"
            icon={
              <div className="pt-2">
                <Star
                  rating={content.myRating}
                  size={11}
                  textStyle="text-12 font-semibold ml-1"
                />
              </div>
            }
          />
          <div className="flex items-center gap-2 text-12 font-semibold text-fg-neutral-muted">
            <StarIcon
              aria-hidden
              className="h-12 w-12 fill-current"
              strokeWidth={1.5}
            />
            <span>
              {content.rating === 0 ? '-' : content.rating.toFixed(1)}
            </span>
            <span className="ml-2 flex items-center">
              (
              <UserRound aria-hidden className="h-12 w-12" />
              {content.totalRatingsCount})
            </span>
          </div>
        </div>

        {/*  태그 */}
        <div className="flex w-full min-w-0 gap-x-4 overflow-x-auto scrollbar-hide">
          {tastingTags.map((tag) => (
            <Label
              key={tag}
              name={tag}
              styleClass="label-default px-8 py-4 text-11"
              baseStyle="inline-flex shrink-0 items-center overflow-hidden"
            />
          ))}
        </div>
      </Link>
    </section>
  );
};

export default memo(WhiskeyListItem);
