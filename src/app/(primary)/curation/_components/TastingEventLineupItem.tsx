import Link from 'next/link';
import { Star, UserRound } from 'lucide-react';
import type { TastingEventAlcohol } from '@/api/curation-v2/types';
import ItemImage from '@/components/feature/List/_components/ItemImage';
import ItemInfo from '@/components/feature/List/_components/ItemInfo';
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
      <div
        className={`absolute left-0 z-10 flex h-20 w-20 items-center justify-center rounded-full bg-bg-neutral-solid text-10 font-bold text-fg-neutral-inverted ${
          chips.length > 0 ? 'top-24' : 'top-12'
        }`}
      >
        {order}
      </div>

      <div className="flex w-full gap-12 overflow-hidden text-fg-neutral">
        <ItemImage
          src={alcohol.imageUrl ?? ''}
          alt={alcohol.korName}
          className="h-128 w-95"
        />

        <div className="flex min-w-0 flex-1 items-baseline justify-between gap-12">
          <div className="min-w-0 flex-1 space-y-8">
            <ItemInfo
              korName={alcohol.korName}
              engName={alcohol.engName ?? ''}
              length={null}
            />

            {details.length > 0 && (
              <p className="text-13 text-fg-neutral">{details.join(' · ')}</p>
            )}

            {typeof stats?.rating === 'number' && (
              <div className="flex items-center gap-4 text-fg-neutral-muted">
                <span className="text-12 font-medium">유저평균</span>
                <Star
                  aria-hidden
                  className="h-12 w-12 fill-current"
                  strokeWidth={1.5}
                />
                <span className="text-12 font-semibold">
                  {stats.rating.toFixed(1)}
                </span>
                <span className="ml-2 flex items-center text-11 font-medium">
                  (
                  <UserRound aria-hidden className="h-12 w-12" />
                  {stats.totalRatingsCount ?? 0})
                </span>
              </div>
            )}
          </div>

          {isDetailAvailable && (
            <span className="link-button shrink-0">상세보기 &gt;</span>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mt-8 flex w-full flex-wrap gap-6">
          {chips.map((chip) => (
            <span
              key={chip}
              className="label-default px-8 py-4 text-11 font-medium"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {comment && (
        <p className="mt-20 text-13 font-medium leading-[1.8] text-fg-neutral-muted">
          {comment}
        </p>
      )}
    </>
  );

  return (
    <article className={`relative ${chips.length > 0 ? 'py-24' : 'py-12'}`}>
      {isDetailAvailable ? (
        <Link
          href={ROUTES.SEARCH.ALL(alcoholId)}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-layer-default"
        >
          {content}
        </Link>
      ) : (
        <div>{content}</div>
      )}
    </article>
  );
}
