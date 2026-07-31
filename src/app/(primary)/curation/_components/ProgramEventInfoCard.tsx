import { Building2, Calendar, MapPin, Ticket } from 'lucide-react';
import type { ProgramPayload } from '@/api/curation-v2/types';
import { cn } from '@/lib/utils';
import {
  formatProgramDateRange,
  getProgramMapSearchUrl,
  getProgramSummary,
} from '@/app/(primary)/curation/_utils/parseProgramPayload';

interface ProgramEventInfoCardProps {
  payload: ProgramPayload;
  className?: string;
}

interface ProgramEventInfoItem {
  key: string;
  Icon: typeof Calendar;
  label: string;
  value: string;
  action?: {
    href: string;
    label: string;
  };
}

export function ProgramEventInfoCard({
  payload,
  className,
}: ProgramEventInfoCardProps) {
  const { entryFeeLabel } = getProgramSummary(payload);
  const fullAddress = [payload.address, payload.detailLocation]
    .filter(Boolean)
    .join(' ');
  const mapSearchUrl = getProgramMapSearchUrl(
    payload.placeName,
    payload.address,
    payload.detailLocation,
  );
  const organizerText = [payload.organizer, payload.sponsor]
    .filter(Boolean)
    .join(' · ');
  const infoItems: ProgramEventInfoItem[] = [
    {
      key: 'date',
      Icon: Calendar,
      label: '행사 기간',
      value: formatProgramDateRange(
        payload.eventStartDate,
        payload.eventEndDate,
      ),
    },
    {
      key: 'place',
      Icon: MapPin,
      label: payload.placeName,
      value: fullAddress,
      action: mapSearchUrl
        ? {
            href: mapSearchUrl,
            label: '지도보기',
          }
        : undefined,
    },
    ...(organizerText
      ? [
          {
            key: 'organizer',
            Icon: Building2,
            label: '주최 / 주관',
            value: organizerText,
          },
        ]
      : []),
    {
      key: 'fee',
      Icon: Ticket,
      label: '참가비',
      value: entryFeeLabel,
    },
  ];

  return (
    <div
      className={cn(
        'rounded-2xl bg-bg-neutral-weak px-4 py-4 text-fg-neutral',
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        {infoItems.map(({ key, Icon, label, value, action }) => (
          <div key={key} className="flex gap-2.5">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-fg-neutral">
              <Icon size={16} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-start justify-between gap-2">
                <p className="min-w-0 flex-1 break-words text-14 font-bold leading-[18px] text-fg-neutral">
                  {label}
                </p>
                {action && (
                  <a
                    href={action.href}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-md bg-bg-layer-default px-3 py-1 text-13 font-bold leading-[17px] text-fg-neutral"
                  >
                    {action.label}
                  </a>
                )}
              </div>
              <p className="mt-1 break-words text-13 font-light leading-[17px] text-fg-neutral-muted">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
