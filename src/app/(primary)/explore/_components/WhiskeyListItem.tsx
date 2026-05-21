import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { LABEL_NAMES } from '@/constants/common';
import { ExploreAlcohol } from '@/types/Explore';
import ItemImage from '@/components/feature/List/_components/ItemImage';
import ItemInfo from '@/components/feature/List/_components/ItemInfo';
import Star from '@/components/ui/Display/Star';
import { ItemStats } from '@/components/feature/List/_components/ItemStats';
import Label from '@/components/ui/Display/Label';

interface Props {
  content: ExploreAlcohol;
  priority?: boolean;
}

const WhiskeyListItem = ({ content, priority = false }: Props) => {
  return (
    <section className="flex items-center text-mainBlack py-6 w-full overflow-hidden">
      {/* image */}
      <Link href={ROUTES.SEARCH.ALL(content.alcoholId)} className="shrink-0">
        <ItemImage
          src={content.alcoholUrlImg}
          alt="image"
          className="w-[95px] h-[128px]"
          priority={priority}
        />
      </Link>

      {/* info */}
      <Link
        href={ROUTES.SEARCH.ALL(content.alcoholId)}
        className="flex min-w-0 flex-1 flex-col items-start justify-center space-y-2"
      >
        <div className="min-w-0 space-y-2">
          <ItemInfo
            korName={content.korName}
            engName={content.engName}
            length={50}
          />
          <p className="text-13 text-mainDarkGray">{`도수 ${content.abv}% · ${content.korCategory}`}</p>
        </div>

        {/* 별점 */}
        <div className="flex items-center gap-x-1">
          <Label
            name={LABEL_NAMES.MY_RATING}
            styleClass="label-default text-12 px-2 py-[1px] rounded-[2px] flex items-end"
            position="after"
            icon={
              <div className="pt-[2px]">
                <Star
                  rating={content.myRating}
                  size={11}
                  textStyle="text-12 font-semibold ml-[1px]"
                />
              </div>
            }
          />
          <div className="text-mainGray">
            <ItemStats
              iconSrc="/icon/star-filled-maingray.svg"
              pointContent={content.rating.toFixed(1)}
              countContent={content.totalRatingsCount.toString()}
              subTextClass="ml-[2px]"
            />
          </div>
        </div>

        {/*  태그 */}
        <div className="flex w-full min-w-0 gap-x-1 overflow-x-auto scrollbar-hide">
          {content.alcoholsTastingTags?.map((tag) => (
            <div key={tag} className="overflow-hidden flex-shrink-0">
              <Label
                name={tag}
                styleClass="label-default border-mainGray text-mainGray px-2 py-1 text-11"
              />
            </div>
          ))}
        </div>
      </Link>
    </section>
  );
};

export default WhiskeyListItem;
