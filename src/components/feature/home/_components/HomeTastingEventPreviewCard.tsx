import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import { CURATION_V2_SPEC_CODES } from '@/api/curation-v2/constants';
import type { TastingEventFeedItem } from '@/api/curation-v2/types';
import AutoMarqueeText from '@/components/ui/Display/AutoMarqueeText';
import BaseImage from '@/components/ui/Display/BaseImage';
import { ROUTES } from '@/constants/routes';
import { parseTastingEventPayload } from '@/app/(primary)/curation/_utils/parseTastingEventPayload';

interface HomeTastingEventPreviewCardProps {
  event: TastingEventFeedItem;
  priority?: boolean;
}

export function HomeTastingEventPreviewCard({
  event,
  priority = false,
}: HomeTastingEventPreviewCardProps) {
  const tastingEvent = parseTastingEventPayload(event.payload);
  const infoItems = [
    {
      key: 'date',
      Icon: Calendar,
      title: tastingEvent.eventDateTimeLabel,
      description: event.payload.guideText,
    },
    {
      key: 'place',
      Icon: MapPin,
      title: tastingEvent.placeLabel,
      description: tastingEvent.fullAddress,
    },
    {
      key: 'capacity',
      Icon: Users,
      title: tastingEvent.capacityLabel,
      description: '',
    },
  ];

  return (
    <Link href={ROUTES.CURATION.DETAIL(event.id)} className="block">
      <article className="relative isolate h-[312px] w-[272px] overflow-hidden rounded-lg bg-sectionWhite">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <BaseImage
            src={event.coverImageUrl}
            alt=""
            fill
            priority={priority}
            sizes="272px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#4A3426]/50 to-[#3B2B22]/70" />
        </div>

        <div className="relative z-10 flex h-full flex-col px-4 pb-4 pt-4">
          <span className="inline-flex w-fit rounded-full bg-white/35 px-2.5 py-1 text-10 font-bold text-white backdrop-blur-sm">
            시음회
          </span>

          <h3 className="mt-3">
            <AutoMarqueeText
              text={event.name}
              className="text-16 font-extrabold leading-[21px] text-white"
            />
          </h3>

          <p className="mt-2 line-clamp-2 text-11 font-light leading-[17px] text-white">
            {event.description}
          </p>

          <div className="mt-auto rounded-2xl bg-white/85 px-3 py-3 backdrop-blur-sm">
            <div className="space-y-2">
              {infoItems.map(({ key, Icon, title, description }) => (
                <div key={key} className="flex gap-2">
                  <span className="mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center text-mainDarkGray">
                    <Icon size={12} strokeWidth={2} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-11 font-bold text-mainDarkGray">
                      {title}
                    </p>
                    {description && (
                      <p className="mt-0.5 truncate text-9 font-light text-mainGray">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-9 font-semibold leading-none text-mainDarkGray">
                참가비
              </span>
              <span className="text-16 font-extrabold leading-none text-mainDarkGray">
                {tastingEvent.entryFeeLabel}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function HomeTastingEventMoreCard() {
  return (
    <Link
      href={`${ROUTES.CURATION.BASE}?tab=${CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT}`}
      className="block"
    >
      <article className="flex h-[312px] w-[190px] flex-col justify-between rounded-lg bg-bgGray px-4 py-5">
        <div>
          <span className="inline-flex w-fit rounded-full bg-white px-2.5 py-1 text-10 font-bold text-subCoral">
            시음회
          </span>
          <h3 className="mt-4 text-16 font-extrabold leading-[21px] text-mainDarkGray">
            더 많은
            <br />
            시음회 보기
          </h3>
          <p className="mt-3 text-11 font-medium leading-[17px] text-mainGray">
            진행 중인 시음회를 한 번에 확인해보세요.
          </p>
        </div>

        <span className="flex h-10 items-center justify-center rounded-lg bg-subCoral text-12 font-bold text-white">
          보러가기
        </span>
      </article>
    </Link>
  );
}
