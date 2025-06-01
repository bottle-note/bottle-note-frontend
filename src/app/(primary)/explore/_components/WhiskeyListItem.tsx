import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ExploreAlcohol } from '@/types/Explore';
import ItemImage from '@/components/List/_components/ItemImage';
import ItemInfo from '@/components/List/_components/ItemInfo';
import { addNewLine } from '@/utils/addNewLine';
import Star from '@/components/Star';
import Label from '../../_components/Label';

interface Props {
  content: ExploreAlcohol;
}

const WhiskeyListItem = ({ content }: Props) => {
  const {
    alcoholId,
    alcoholUrlImg,
    korName,
    engName,
    korCategory,
    engCategory,
    korRegion,
    engRegion,
    cask,
    abv,
    korDistillery,
    engDistillery,
    rating,
    totalRatingsCount,
    myRating,
    myAvgRating,
    isPicked,
    alcoholsTastingTags,
  } = content;
  return (
    <section className="flex items-center text-mainBlack py-1">
      {/* image */}
      <Link href={ROUTES.SEARCH.ALL(alcoholId)}>
        <ItemImage src={alcoholUrlImg} alt="image" />
      </Link>

      {/* info */}
      <Link
        href={ROUTES.SEARCH.ALL(alcoholId)}
        className="flex flex-col items-start justify-center space-y-1.5"
      >
        <div>
          <ItemInfo
            korName={addNewLine(korName)}
            engName={engName}
            length={50}
          />
          <p className="text-10 text-mainDarkGray">{`도수 ${abv}% · ${korCategory}`}</p>
        </div>
        <Label
          name="나의 별점"
          styleClass="label-default text-10 px-2 py-[2px] rounded-xs flex items-center"
          position="after"
          icon={<Star rating={myRating} size={12} />}
        />
      </Link>
    </section>
  );
};

export default WhiskeyListItem;
