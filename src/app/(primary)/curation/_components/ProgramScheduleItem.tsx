import { CalendarClock, MapPin, UserRound } from 'lucide-react';
import type { ProgramSchedule } from '@/api/curation-v2/types';
import { TastingEventLineupItem } from '@/app/(primary)/curation/_components/TastingEventLineupItem';
import {
  formatProgramDate,
  formatProgramTime,
  formatProgramType,
} from '@/app/(primary)/curation/_utils/parseProgramPayload';

interface ProgramScheduleItemProps {
  program: ProgramSchedule;
  order: number;
}

export function ProgramScheduleItem({
  program,
  order,
}: ProgramScheduleItemProps) {
  const dateTime = `${formatProgramDate(program.programDate)} · ${formatProgramTime(
    program.startTime,
    program.endTime,
  )}`;

  return (
    <article className="border-b border-bgGray py-6 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mainDarkGray text-11 font-bold text-white">
          {order}
        </span>
        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-full bg-sectionWhite px-2 py-1 text-11 font-bold text-subCoral">
            {formatProgramType(program.type)}
          </span>
          <h3 className="mt-2 text-16 font-extrabold leading-5 text-mainDarkGray">
            {program.name}
          </h3>

          <div className="mt-3 space-y-2 text-13 font-medium leading-[17px] text-mainGray">
            <p className="flex gap-2">
              <CalendarClock size={16} className="shrink-0" aria-hidden />
              <span>{dateTime}</span>
            </p>
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
          </div>

          <p className="mt-4 whitespace-pre-line text-13 font-medium leading-[1.7] text-mainDarkGray">
            {program.description}
          </p>

          {program.applicationUrl && (
            <a
              href={program.applicationUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex h-9 items-center rounded-lg border border-subCoral px-3 text-13 font-bold text-subCoral"
            >
              프로그램 신청하기
            </a>
          )}

          {program.whiskies && program.whiskies.length > 0 && (
            <section className="mt-6">
              <h4 className="text-14 font-extrabold text-mainDarkGray">
                시음 위스키
              </h4>
              <div className="mt-3 divide-y divide-bgGray border-t border-bgGray">
                {program.whiskies.map((whisky, index) => (
                  <TastingEventLineupItem
                    key={
                      whisky.source ??
                      whisky.alcohol.alcoholId ??
                      `${whisky.alcohol.korName}-${index}`
                    }
                    item={whisky}
                    order={index + 1}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
