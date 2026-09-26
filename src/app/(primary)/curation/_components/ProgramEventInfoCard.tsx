import { Building2, Calendar, MapPin, Users } from 'lucide-react';
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
  title: string;
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
      title: formatProgramDateRange(
        payload.eventStartDate,
        payload.eventEndDate,
      ),
    },
    {
      key: 'place',
      Icon: MapPin,
      title: fullAddress,
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
            title: organizerText,
          },
        ]
      : []),
    {
      key: 'programs',
      Icon: Users,
      title: `프로그램 ${payload.programs?.length ?? 0}개`,
    },
  ];

  return (
    <div
      className={cn(
        'rounded-2xl bg-bg-neutral-weak px-16 py-16 text-fg-neutral',
        className,
      )}
    >
      <div className="flex flex-col gap-24">
        {infoItems.map(({ key, Icon, title, action }) => (
          <div key={key} className="flex gap-10">
            <span className="mt-2 flex h-16 w-16 shrink-0 items-center justify-center text-fg-neutral">
              <Icon size={16} strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-1 items-start justify-between gap-8">
              <p className="min-w-0 flex-1 break-words text-14 font-bold text-fg-neutral">
                {title}
              </p>
              {action && (
                <a
                  href={action.href}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-md bg-bg-layer-default px-12 py-4 text-13 font-bold text-fg-neutral"
                >
                  {action.label}
                </a>
              )}
            </div>
          </div>
        ))}

        <div className="flex items-end justify-between gap-8 border-t border-stroke-neutral-basement pt-16">
          <span className="text-13 font-semibold text-fg-neutral">참가비</span>
          <span className="text-right text-19 font-bold leading-none text-fg-neutral">
            {entryFeeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
