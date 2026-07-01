import { Calendar, MapPin, Users } from 'lucide-react';
import type { TastingEventPayload } from '@/api/curation-v2/types';
import { cn } from '@/lib/utils';
import { parseTastingEventPayload } from '@/app/(primary)/curation/_utils/parseTastingEventPayload';

interface TastingEventInfoCardProps {
  payload: TastingEventPayload;
  label?: string;
  showMapCta?: boolean;
  className?: string;
  labelClassName?: string;
}

export function TastingEventInfoCard({
  payload,
  label,
  showMapCta = false,
  className,
  labelClassName,
}: TastingEventInfoCardProps) {
  const tastingEvent = parseTastingEventPayload(payload);
  const infoItems = [
    {
      key: 'date',
      Icon: Calendar,
      title: tastingEvent.eventDateTimeLabel,
      description: payload.guideText,
    },
    {
      key: 'place',
      Icon: MapPin,
      title: payload.barAddress,
      description: payload.detailAddress,
      action: showMapCta
        ? {
            href: tastingEvent.mapSearchUrl,
            label: '지도보기',
          }
        : undefined,
    },
    {
      key: 'capacity',
      Icon: Users,
      title: tastingEvent.capacityLabel,
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-2xl bg-white/80 px-4 py-4 backdrop-blur-sm',
        className,
      )}
    >
      {label && (
        <span
          className={cn(
            'inline-flex w-fit rounded-full bg-mainCoral px-2.5 py-1 text-[12px] font-bold text-white',
            labelClassName,
          )}
        >
          {label}
        </span>
      )}

      <div className={cn('flex h-full flex-col gap-4', label && 'mt-2')}>
        {infoItems.map(({ key, Icon, title, description, action }) => (
          <div key={key} className="flex gap-2.5">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-mainDarkGray">
              <Icon size={16} strokeWidth={2} />
            </span>

            <div className="flex min-w-0 flex-col w-full gap-1">
              <div className="flex min-w-0 items-start justify-between w-full gap-2">
                <p className="min-w-0 flex-1 truncate text-13 font-bold text-mainDarkGray">
                  {title}
                </p>
                {action?.href && (
                  <a
                    href={action.href}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-md bg-white px-3 py-1 text-12 font-bold leading-sm text-mainDarkGray"
                  >
                    {action.label}
                  </a>
                )}
              </div>
              {description && (
                <p className="truncate text-12 font-light text-mainGray">
                  {description}
                </p>
              )}
            </div>
          </div>
        ))}

        <div className="mt-auto flex items-end gap-2">
          <span className="text-10 font-semibold leading-none text-mainDarkGray">
            참가비
          </span>
          <span className="text-[19px] font-bold leading-none text-mainDarkGray">
            {tastingEvent.entryFeeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
