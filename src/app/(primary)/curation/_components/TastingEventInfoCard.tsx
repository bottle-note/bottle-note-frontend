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
  const labelTextClassName = shouldWrapText ? 'text-13' : 'text-12';
  const titleTextClassName = shouldWrapText
    ? 'whitespace-normal break-words text-14'
    : 'truncate text-12';
  const getDescriptionTextClassName = (key: string) => {
    if (shouldWrapText) {
      return 'whitespace-normal break-words text-13';
    }

    if (key === 'place') {
      return 'line-clamp-2 whitespace-normal break-words text-12';
    }

    return 'truncate text-12';
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
        'flex flex-col gap-8 rounded-2xl bg-bg-layer-floating px-16 py-16 text-fg-neutral',
        className,
      )}
    >
      {label && (
        <span
          className={[
            'inline-flex w-fit rounded-full bg-bg-brand-primary-solid px-10 py-4 font-bold text-fg-brand-contrast',
            labelTextClassName,
            labelClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </span>
      )}

      <div
        className={cn(
          'flex h-full flex-col',
          shouldWrapText ? 'gap-24' : 'gap-16',
          label && 'mt-8',
        )}
      >
        {infoItems.map(({ key, Icon, title, description, action }) => (
          <div key={key} className="flex gap-10">
            <span className="mt-2 flex h-16 w-16 shrink-0 items-center justify-center text-fg-neutral">
              <Icon size={16} strokeWidth={2} />
            </span>

            <div className="flex min-w-0 flex-col w-full gap-4">
              <div className="flex min-w-0 items-start justify-between w-full gap-8">
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
                      'shrink-0 rounded-md bg-bg-layer-default px-12 py-4 font-bold text-fg-neutral',
                      shouldWrapText ? 'text-13' : 'text-12 leading-sm',
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

        <div className="mt-auto flex items-end justify-between gap-8 border-t border-stroke-neutral-basement pt-16">
          <span
            className={`font-semibold text-fg-neutral ${
              shouldWrapText ? 'text-13' : 'text-10 leading-none'
            }`}
          >
            참가비
          </span>
          <span className="text-right text-19 font-bold leading-none text-fg-neutral">
            {tastingEvent.entryFeeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
