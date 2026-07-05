import Link from 'next/link';
import type { TastingEventFeedItem } from '@/api/curation-v2/types';
import BaseImage from '@/components/ui/Display/BaseImage';
import { ROUTES } from '@/constants/routes';
import { TastingEventInfoCard } from '@/app/(primary)/curation/_components/TastingEventInfoCard';

interface TastingEventFeedCardProps {
  event: TastingEventFeedItem;
  priority?: boolean;
}

export function TastingEventFeedCard({
  event,
  priority = false,
}: TastingEventFeedCardProps) {
  return (
    <Link href={ROUTES.CURATION.DETAIL(event.id)} className="block">
      <article className="relative isolate h-[390px] w-full overflow-hidden rounded-lg bg-sectionWhite">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <BaseImage
            src={event.coverImageUrl}
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
            <span className="inline-flex rounded-full bg-white/30 px-2.5 py-1 text-12 font-bold text-white backdrop-blur-sm">
              시음회
            </span>
            <h2 className="mt-4 line-clamp-2 text-20 font-extrabold text-white">
              {event.name}
            </h2>
            <p className="mt-3.5 line-clamp-3 text-12 font-light leading-[18px] text-white">
              {event.description}
            </p>
          </div>

          <TastingEventInfoCard payload={event.payload} />
        </div>
      </article>
    </Link>
  );
}
