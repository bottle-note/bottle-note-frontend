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
  const details = [alcohol.abv && `도수 ${alcohol.abv}%`].filter(isText);
  const chips = [...(alcohol.selectedTags ?? [])].filter(isText);
  const alcoholId = alcohol.alcoholId;
  const isDetailAvailable = alcoholId != null;
  const content = (
    <>
      <div className="absolute z-10 left-0 top-6 flex h-5 w-5 items-center justify-center rounded-full bg-mainDarkGray text-10 font-bold text-white">
        {order}
      </div>

      <div className="flex w-full gap-3 overflow-hidden text-mainBlack">
        <ItemImage
          src={alcohol.imageUrl ?? ''}
          alt={alcohol.korName}
          className="h-[128px] w-[95px]"
        />

        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <ItemInfo
              korName={alcohol.korName}
              engName={alcohol.engName ?? ''}
              length={null}
            />

            {details.length > 0 && (
              <p className="text-13 text-mainDarkGray">{details.join(' · ')}</p>
            )}

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

          {isDetailAvailable && (
            <div className="shrink-0 pt-0.5">
              <span className="link-button">상세보기 &gt;</span>
            </div>
          )}
        </div>
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
    </>
  );

  return (
    <article className="relative py-6">
      {isDetailAvailable ? (
        <Link
          href={ROUTES.SEARCH.ALL(alcoholId)}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-subCoral focus-visible:ring-offset-2"
        >
          {content}
        </Link>
      ) : (
        <div>{content}</div>
      )}
    </article>
  );
}
