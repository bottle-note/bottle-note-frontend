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
      <div className="absolute left-0 top-6 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-bg-neutral-solid text-10 font-bold text-fg-neutral-inverted">
        {order}
      </div>

      <div className="flex w-full gap-3 overflow-hidden text-fg-neutral">
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
              <p className="text-13 text-fg-neutral">{details.join(' · ')}</p>
            )}

            {typeof stats?.rating === 'number' && (
              <div className="flex items-center gap-1 text-fg-neutral-muted">
                <span className="text-12 font-medium">유저평균</span>
                <Star
                  aria-hidden
                  className="h-3 w-3 fill-current"
                  strokeWidth={1.5}
                />
                <span className="text-12 font-semibold">
                  {stats.rating.toFixed(1)}
                </span>
                <span className="ml-0.5 flex items-center text-11 font-medium">
                  (
                  <UserRound aria-hidden className="h-3 w-3" />
                  {stats.totalRatingsCount ?? 0})
                </span>
              </div>
            )}
          </div>

          {isDetailAvailable && (
            <div className="shrink-0">
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
              className="label-default px-2 py-1 text-11 font-medium"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {comment && (
        <p className="mt-5 text-13 font-medium leading-[1.8] text-fg-neutral-muted">
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
