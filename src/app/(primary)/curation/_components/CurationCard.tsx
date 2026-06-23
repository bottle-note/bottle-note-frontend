import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import BaseImage from '@/components/ui/Display/BaseImage';
import { isTastingEventFeedItem } from '@/api/curation-v2/guards';
import type { CurationV2FeedItem } from '@/api/curation-v2/types';
import { ROUTES } from '@/constants/routes';

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
  const eventDateLabel = (() => {
    if (!isTastingEvent) {
      return '';
    }

    const date = new Date(curation.payload.eventDate);

    if (Number.isNaN(date.getTime())) {
      return curation.payload.eventDate;
    }

    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${
      weekdays[date.getDay()]
    })`;
  })();
  const entryFeeLabel =
    isTastingEvent && curation.payload.entryFee > 0
      ? `${curation.payload.entryFee.toLocaleString('ko-KR')}원`
      : '무료';
  const href = isTastingEvent
    ? ROUTES.CURATION.DETAIL(curation.id)
    : `/search?curationId=${curation.id}`;
  const tagLabel =
    isTastingEvent && curation.payload.isRecruiting
      ? '시음회'
      : curation.specName ?? '큐레이션';

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
          <span className="inline-flex rounded-full bg-white/30 px-2.5 py-1 text-10 font-bold text-white backdrop-blur-sm">
            {tagLabel}
          </span>
          <h2 className="mt-4 line-clamp-2 text-20 font-extrabold text-white truncate">
            {curation.name}
          </h2>
          <p className="mt-3.5 line-clamp-3 text-12 font-medium text-white truncate">
            {curation.description}
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-white/80 px-4 py-4 backdrop-blur-sm">
          {isTastingEvent ? (
            <div className="flex h-full flex-col gap-4">
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center text-mainDarkGray">
                  <Calendar size={14} strokeWidth={2} />
                </span>

                <div className="flex gap-1 flex-col">
                  <p className="text-13 font-bold text-mainDarkGray">
                    {eventDateLabel} · {curation.payload.eventTime}
                  </p>
                  {curation.payload.guideText && (
                    <p className="truncate text-11 font-light text-mainGray">
                      {curation.payload.guideText}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center text-mainDarkGray">
                  <MapPin size={14} strokeWidth={2} />
                </span>
                <div className="flex gap-1 flex-col">
                  <p className="text-13 font-bold text-mainDarkGray">
                    {curation.payload.barAddress}
                  </p>
                  {curation.payload.detailAddress && (
                    <p className="truncate text-11 font-light text-mainGray">
                      {curation.payload.detailAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center text-mainDarkGray">
                  <Users size={14} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-12 font-bold text-mainDarkGray">
                    {curation.payload.capacity.toLocaleString('ko-KR')}명 정원
                  </p>
                </div>
              </div>

              <div className="mt-auto flex items-end gap-2">
                <span className="text-10 font-bold leading-none text-mainDarkGray">
                  참가비
                </span>
                <span className="text-20 font-black leading-none text-mainDarkGray">
                  {entryFeeLabel}
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
      </div>
    </article>
  );

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
