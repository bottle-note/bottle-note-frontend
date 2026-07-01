import Link from 'next/link';
import BaseImage from '@/components/ui/Display/BaseImage';
import { isTastingEventFeedItem } from '@/api/curation-v2/guards';
import type { CurationV2FeedItem } from '@/api/curation-v2/types';
import { ROUTES } from '@/constants/routes';
import { TastingEventInfoCard } from '@/app/(primary)/curation/_components/TastingEventInfoCard';

interface Props {
  curation: CurationV2FeedItem;
  priority?: boolean;
}

export function CurationCard({ curation, priority = false }: Props) {
  const isTastingEvent = isTastingEventFeedItem(curation);
  const chips = Array.isArray(curation.payload)
    ? Array.from(
        new Set(
          curation.payload.flatMap((item) => {
            const alcohol = item.alcohol;

            if (!alcohol) {
              return [];
            }

            return [
              ...(alcohol.selectedTags ?? []),
              alcohol.korCategory,
              alcohol.regionName,
            ].filter((chip): chip is string => Boolean(chip));
          }),
        ),
      ).slice(0, 3)
    : [];
  const href = isTastingEvent
    ? ROUTES.CURATION.DETAIL(curation.id)
    : `/search?curationId=${curation.id}`;
  const tagLabel = isTastingEvent ? '시음회' : curation.specName ?? '큐레이션';
  const summaryContent = chips.length > 0 && (
    <div className="mt-auto flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip}
          className="label-default truncate px-2 py-1 text-11 font-medium"
        >
          {chip}
        </span>
      ))}
    </div>
  );
  const infoCardContent = isTastingEvent ? (
    <TastingEventInfoCard payload={curation.payload} />
  ) : (
    <div className="flex flex-col gap-2 rounded-2xl bg-white/80 px-4 py-4 backdrop-blur-sm">
      <div className="flex h-full flex-col">
        <p className="line-clamp-4 text-13 font-medium text-mainDarkGray">
          {curation.description}
        </p>
        {summaryContent}
      </div>
    </div>
  );

  const content = (
    <article className="relative isolate h-[390px] w-full overflow-hidden rounded-lg bg-sectionWhite">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <BaseImage
          src={curation.coverImageUrl}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 468px) calc(100vw - 40px), 428px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between px-4 pb-5 pt-5">
        <div>
          <span className="inline-flex rounded-full bg-white/30 px-2.5 py-1 text-12 font-bold text-white backdrop-blur-sm">
            {tagLabel}
          </span>
          <h2 className="mt-4 line-clamp-2 text-20 font-extrabold text-white truncate">
            {curation.name}
          </h2>
          <p className="mt-3.5 line-clamp-3 text-12 font-medium text-white truncate">
            {curation.description}
          </p>
        </div>

        {/* 시음회 정보 카드 */}
        {infoCardContent}
      </div>
    </article>
  );

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
