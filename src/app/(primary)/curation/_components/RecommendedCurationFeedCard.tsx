import Link from 'next/link';
import type { CurationV2FeedItem } from '@/api/curation-v2/types';
import BaseImage from '@/components/ui/Display/BaseImage';
import { ROUTES } from '@/constants/routes';

interface RecommendedCurationFeedCardProps {
  curation: CurationV2FeedItem;
  priority?: boolean;
}

export function RecommendedCurationFeedCard({
  curation,
  priority = false,
}: RecommendedCurationFeedCardProps) {
  return (
    <Link href={ROUTES.CURATION.DETAIL(curation.id)} className="block">
      <article className="relative isolate h-[157px] w-full overflow-hidden rounded-lg bg-sectionWhite">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <BaseImage
            src={curation.coverImageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 468px) calc(100vw - 40px), 428px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
          <div className="absolute inset-0 bg-[#5F3826]/20" />
        </div>

        <div className="relative z-10 flex h-full flex-col px-4 pb-4 pt-4">
          <span className="inline-flex w-fit rounded-full bg-white/30 px-2.5 py-1 text-11 font-bold text-white backdrop-blur-sm">
            큐레이션
          </span>
          <h2 className="mt-4 line-clamp-2 text-[22px] font-extrabold leading-[26px] text-white">
            {curation.name}
          </h2>
          <p className="mt-2 line-clamp-2 text-12 font-light leading-[18px] text-white">
            {curation.description}
          </p>
        </div>
      </article>
    </Link>
  );
}
