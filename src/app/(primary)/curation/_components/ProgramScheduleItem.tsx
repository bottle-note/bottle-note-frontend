import {
  CalendarClock,
  Link as LinkIcon,
  MapPin,
  UserRound,
} from 'lucide-react';
import type { ProgramSchedule } from '@/api/curation-v2/types';
import { TastingEventLineupItem } from '@/app/(primary)/curation/_components/TastingEventLineupItem';
import {
  formatProgramDate,
  formatProgramTime,
  formatProgramType,
} from '@/app/(primary)/curation/_utils/parseProgramPayload';

interface ProgramScheduleItemProps {
  program: ProgramSchedule;
}

export function ProgramScheduleItem({ program }: ProgramScheduleItemProps) {
  const dateTime = [
    program.programDate && formatProgramDate(program.programDate),
    program.startTime && formatProgramTime(program.startTime, program.endTime),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="rounded-xl border border-stroke-neutral-subtle p-4">
      <span className="inline-flex rounded-full bg-bg-brand-weak px-2 py-1 text-11 font-bold text-fg-brand">
        {formatProgramType(program.type)}
      </span>
      <h3 className="mt-2 text-16 font-extrabold leading-5 text-fg-neutral">
        {program.name}
      </h3>

      <div className="mt-3 space-y-2 text-13 font-medium leading-[17px] text-fg-neutral-muted">
        {program.venue && (
          <p className="flex gap-2">
            <MapPin size={16} className="shrink-0" aria-hidden />
            <span>{program.venue}</span>
          </p>
        )}
        {program.host && (
          <p className="flex gap-2">
            <UserRound size={16} className="shrink-0" aria-hidden />
            <span>{program.host}</span>
          </p>
        )}
        {program.applicationUrl && (
          <a
            href={program.applicationUrl}
            target="_blank"
            rel="noreferrer"
            className="flex gap-2 font-bold text-fg-brand"
          >
            <LinkIcon size={16} className="shrink-0" aria-hidden />
            <span className="break-all">
              안내 링크 : {program.applicationUrl}
            </span>
          </a>
        )}
        {dateTime && (
          <p className="flex gap-2">
            <CalendarClock size={16} className="shrink-0" aria-hidden />
            <span>{dateTime}</span>
          </p>
        )}
      </div>

      {program.description && (
        <p className="mt-4 whitespace-pre-line text-13 font-medium leading-[1.7] text-fg-neutral">
          {program.description}
        </p>
      )}

      {program.whiskies && program.whiskies.length > 0 && (
        <section className="mt-6">
          <h4 className="text-14 font-extrabold text-fg-neutral">
            시음 위스키
          </h4>
          <div className="mt-3 divide-y divide-stroke-neutral-basement border-t border-stroke-neutral-basement">
            {program.whiskies.map((whisky, index) => (
              <TastingEventLineupItem
                key={
                  whisky.alcohol.alcoholId != null
                    ? `alcohol-${whisky.alcohol.alcoholId}`
                    : `manual-${whisky.alcohol.korName}-${whisky.alcohol.engName ?? ''}`
                }
                item={whisky}
                order={index + 1}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
