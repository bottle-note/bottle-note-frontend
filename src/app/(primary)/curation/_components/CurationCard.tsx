import type { ReactNode } from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import BaseImage from '@/components/ui/Display/BaseImage';
import { isTastingEventFeedItem } from '@/api/curation-v2/guards';
import type { CurationV2FeedItem } from '@/api/curation-v2/types';
import { ROUTES } from '@/constants/routes';
import {
  formatEntryFee,
  formatEventDate,
} from '@/app/(primary)/curation/_utils/tastingEventFormat';

interface Props {
  curation: CurationV2FeedItem;
  priority?: boolean;
}

const getCurationCardChips = (curation: CurationV2FeedItem) => {
  if (!Array.isArray(curation.payload)) {
    return [];
  }

  const chips = curation.payload.flatMap((item) => {
    const alcohol = item.alcohol;
    if (!alcohol) {
      return [];
    }

    return [
      ...(alcohol.selectedTags ?? []),
      alcohol.korCategory,
      alcohol.regionName,
    ].filter(Boolean);
  });

  return Array.from(new Set(chips)).slice(0, 3);
};

const EventInfoRow = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
}) => (
  <div className="flex gap-2">
    <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center text-mainDarkGray">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-12 font-bold text-mainDarkGray">{title}</p>
      {description && (
        <p className="mt-1 truncate text-10 font-medium text-mainGray">
          {description}
        </p>
      )}
    </div>
  </div>
);

export function CurationCard({ curation, priority = false }: Props) {
  const chips = getCurationCardChips(curation);
  const isTastingEvent = isTastingEventFeedItem(curation);
  const href = isTastingEvent
    ? ROUTES.CURATION.DETAIL(curation.id)
    : `/search?curationId=${curation.id}`;
  const tagLabel =
    isTastingEvent && curation.payload.isRecruiting
      ? '시음회'
      : curation.specName ?? '큐레이션';
  const content = (
    <article className="relative h-96 w-full overflow-hidden rounded-md bg-sectionWhite">
      <BaseImage
        src={curation.coverImageUrl}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 468px) calc(100vw - 40px), 428px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/45" />

      <div className="absolute left-4 right-4 top-5">
        <span className="inline-flex rounded-full bg-white/25 px-2.5 py-1 text-10 font-bold text-white backdrop-blur-sm">
          {tagLabel}
        </span>
        <h2 className="mt-4 line-clamp-2 text-20 font-extrabold text-white">
          {curation.name}
        </h2>
        <p className="mt-3.5 line-clamp-3 text-12 font-medium text-white">
          {curation.description}
        </p>
      </div>

      <div className="absolute bottom-5 left-4 right-4 min-h-48 rounded-xl bg-white/80 px-4 py-4 backdrop-blur-sm">
        {isTastingEvent ? (
          <div className="flex h-full flex-col gap-4">
            <EventInfoRow
              icon={<CalendarDays size={14} strokeWidth={2} />}
              title={`${formatEventDate(curation.payload.eventDate)} · ${
                curation.payload.eventTime
              }`}
              description={curation.payload.guideText}
            />
            <EventInfoRow
              icon={<MapPin size={14} strokeWidth={2} />}
              title={curation.payload.barAddress}
              description={curation.payload.detailAddress}
            />
            <EventInfoRow
              icon={<Users size={14} strokeWidth={2} />}
              title={`${curation.payload.capacity.toLocaleString('ko-KR')}명 정원`}
            />
            <div className="mt-auto flex items-end gap-2">
              <span className="text-10 font-bold leading-none text-mainDarkGray">
                참가비
              </span>
              <span className="text-20 font-black leading-none text-mainDarkGray">
                {formatEntryFee(curation.payload.entryFee)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <p className="line-clamp-4 text-13 font-medium text-mainDarkGray">
              {curation.description}
            </p>
            {chips.length > 0 && (
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
            )}
          </div>
        )}
      </div>
    </article>
  );

  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="block">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
