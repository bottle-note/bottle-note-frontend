import Link from 'next/link';
import type { ProgramFeedItem } from '@/api/curation-v2/types';
import BaseImage from '@/components/ui/Display/BaseImage';
import { ROUTES } from '@/constants/routes';
import { getProgramSummary } from '@/app/(primary)/curation/_utils/parseProgramPayload';

interface ProgramFeedCardProps {
  program: ProgramFeedItem;
  priority?: boolean;
}

export function ProgramFeedCard({
  program,
  priority = false,
}: ProgramFeedCardProps) {
  const { dateLabel, entryFeeLabel, tagLabels } = getProgramSummary(
    program.payload,
  );
  const programCountLabel = `프로그램 ${program.payload.programs.length}개`;

  return (
    <Link href={ROUTES.CURATION.DETAIL(program.id)} className="block">
      <article className="relative isolate h-[248px] w-full overflow-hidden rounded-lg bg-bg-neutral-weak">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <BaseImage
            src={program.coverImageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 468px) calc(100vw - 40px), 428px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/75" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between px-4 pb-4 pt-4 text-white">
          <div>
            <span className="inline-flex rounded-full bg-white/30 px-2.5 py-1 text-11 font-bold backdrop-blur-sm">
              프로그램
            </span>
            <h2 className="mt-3 line-clamp-2 text-20 font-extrabold leading-6">
              {program.name}
            </h2>
            <p className="mt-2 line-clamp-2 text-12 font-light leading-[18px]">
              {program.description}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-12 font-bold">
              {dateLabel} · {program.payload.placeName}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-11 font-medium">
              <span className="rounded-full bg-white/20 px-2 py-1 backdrop-blur-sm">
                {entryFeeLabel}
              </span>
              <span className="rounded-full bg-white/20 px-2 py-1 backdrop-blur-sm">
                {programCountLabel}
              </span>
              {tagLabels.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/20 px-2 py-1 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
