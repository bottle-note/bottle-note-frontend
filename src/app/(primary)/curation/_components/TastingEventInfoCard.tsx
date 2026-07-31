import { Calendar, MapPin, Users } from 'lucide-react';
import type { TastingEventPayload } from '@/api/curation-v2/types';
import { cn } from '@/lib/utils';
import { parseTastingEventPayload } from '@/app/(primary)/curation/_utils/parseTastingEventPayload';

interface TastingEventInfoCardProps {
  payload: TastingEventPayload;
  label?: string;
  showMapCta?: boolean;
  textBehavior?: 'truncate' | 'wrap';
  className?: string;
  labelClassName?: string;
}

export function TastingEventInfoCard({
  payload,
  label,
  showMapCta = false,
  textBehavior = 'truncate',
  className,
  labelClassName,
}: TastingEventInfoCardProps) {
  const tastingEvent = parseTastingEventPayload(payload);
  const shouldWrapText = textBehavior === 'wrap';
  const labelTextClassName = shouldWrapText
    ? 'text-13 leading-[17px]'
    : 'text-[12px] leading-[16px]';
  const titleTextClassName = shouldWrapText
    ? 'whitespace-normal break-words text-14 leading-[18px]'
    : 'truncate text-[12px] leading-[16px]';
  const getDescriptionTextClassName = (key: string) => {
    if (shouldWrapText) {
      return 'whitespace-normal break-words text-13 leading-[17px]';
    }

    if (key === 'place') {
      return 'line-clamp-2 whitespace-normal break-words text-[12px] leading-[16px]';
    }

    return 'truncate text-[12px] leading-[16px]';
  };
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
      title: tastingEvent.placeLabel,
      description: tastingEvent.fullAddress,
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
        'flex flex-col gap-2 rounded-2xl bg-bg-layer-floating px-4 py-4 text-fg-neutral',
        className,
      )}
    >
      {label && (
        <span
          className={[
            'inline-flex w-fit rounded-full bg-bg-brand-solid px-2.5 py-1 font-bold text-fg-brand-contrast',
            labelTextClassName,
            labelClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </span>
      )}

      <div className={cn('flex h-full flex-col gap-4', label && 'mt-2')}>
        {infoItems.map(({ key, Icon, title, description, action }) => (
          <div key={key} className="flex gap-2.5">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-fg-neutral">
              <Icon size={16} strokeWidth={2} />
            </span>

            <div className="flex min-w-0 flex-col w-full gap-1">
              <div className="flex min-w-0 items-start justify-between w-full gap-2">
                {title && (
                  <p
                    className={`min-w-0 flex-1 font-bold ${titleTextClassName}`}
                  >
                    {title}
                  </p>
                )}
                {action?.href && (
                  <a
                    href={action.href}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      'shrink-0 rounded-md bg-bg-layer-default px-3 py-1 font-bold text-fg-neutral',
                      shouldWrapText
                        ? 'text-13 leading-[17px]'
                        : 'text-12 leading-sm',
                    )}
                  >
                    {action.label}
                  </a>
                )}
              </div>
              {description && (
                <p
                  className={`font-light text-fg-neutral-muted ${getDescriptionTextClassName(key)}`}
                >
                  {description}
                </p>
              )}
            </div>
          </div>
        ))}

        <div className="mt-auto flex items-end gap-2">
          <span
            className={`font-semibold text-fg-neutral ${
              shouldWrapText
                ? 'text-13 leading-[17px]'
                : 'text-[10px] leading-none'
            }`}
          >
            참가비
          </span>
          <span className="text-[19px] font-bold leading-none text-fg-neutral">
            {tastingEvent.entryFeeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
