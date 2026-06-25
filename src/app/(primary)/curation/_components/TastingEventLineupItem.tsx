import Link from 'next/link';
import type { TastingEventAlcohol } from '@/api/curation-v2/types';
import ItemImage from '@/components/feature/List/_components/ItemImage';
import ItemInfo from '@/components/feature/List/_components/ItemInfo';
import { ItemStats } from '@/components/feature/List/_components/ItemStats';
import { ROUTES } from '@/constants/routes';

const isText = (value?: string | null): value is string => Boolean(value);

interface TastingEventLineupItemProps {
  item: TastingEventAlcohol;
  order: number;
}

export function TastingEventLineupItem({
  item,
  order,
}: TastingEventLineupItemProps) {
  const { alcohol, stats, comment } = item;
  const details = [
    alcohol.abv && `도수 ${alcohol.abv}%`,
    alcohol.korCategory,
  ].filter(isText);
  const chips = [
    ...(alcohol.selectedTags ?? []),
    alcohol.korCategory,
    alcohol.regionName,
  ].filter(isText);
  const alcoholContent = (
    <>
      <ItemImage
        src={alcohol.imageUrl ?? ''}
        alt={alcohol.korName}
        className="h-[128px] w-[95px]"
      />

      <div className="flex min-w-0 flex-1 flex-col items-start justify-center space-y-2">
        <div className="min-w-0 space-y-2">
          <ItemInfo
            korName={alcohol.korName}
            engName={alcohol.engName ?? ''}
            length={50}
          />

          {details.length > 0 && (
            <p className="text-13 text-mainDarkGray">{details.join(' · ')}</p>
          )}
        </div>

        {typeof stats?.rating === 'number' && (
          <div className="flex items-center gap-1 text-mainGray">
            <span className="text-12 font-medium">유저평균</span>
            <ItemStats
              iconSrc="/icon/star-filled-maingray.svg"
              pointContent={stats.rating.toFixed(1)}
              countContent={(stats.totalRatingsCount ?? 0).toString()}
              subTextClass="ml-[2px] text-11 font-medium"
              mainTextClass="justify-start text-mainGray"
            />
          </div>
        )}
      </div>
    </>
  );

  return (
    <article className="relative py-6">
      <div className="absolute z-10 left-0 top-6 flex h-5 w-5 items-center justify-center rounded-full bg-mainDarkGray text-10 font-bold text-white">
        {order}
      </div>

      <div className="flex w-full overflow-hidden text-mainBlack">
        {alcohol.alcoholId ? (
          <Link
            href={ROUTES.SEARCH.ALL(alcohol.alcoholId)}
            className="flex min-w-0 flex-1 gap-3"
          >
            {alcoholContent}
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 gap-3">{alcoholContent}</div>
        )}
      </div>

      {chips.length > 0 && (
        <div className="mt-5 flex w-full flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip}
              className="label-default border-mainGray px-2 py-1 text-11 font-medium text-mainGray"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {comment && (
        <p className="mt-5 text-13 font-medium leading-[1.8] text-mainGray">
          {comment}
        </p>
      )}
    </article>
  );
}
