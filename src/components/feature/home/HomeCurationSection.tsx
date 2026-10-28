'use client';

import Link from 'next/link';
import BaseImage from '@/components/ui/Display/BaseImage';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import {
  CURATION_FEED_KIND_LABEL,
  getCurationFeedKind,
} from '@/api/curation-v2/feedKind';
import type { CurationV2FeedItem } from '@/api/curation-v2/types';
import { ROUTES } from '@/constants/routes';
import { useHomeCurationsQuery } from '@/queries/useHomeCurationsQuery';
import { trackGA4Event } from '@/utils/analytics/ga4';

import HomeSectionHeader from './HomeSectionHeader';
import { HomeFeaturedErrorState } from './_components/HomeFeaturedErrorState';

const SECTION_LABEL = "EDITOR'S PICK";
const SECTION_TITLE = '보틀노트 에디터가\n직접 골라봤어요✨';

/** 에디터 추천: 큐레이션·페어링·프로그램을 가로로 넘기는 커버 카드. 비어 있으면 섹션을 숨긴다. */
export default function HomeCurationSection() {
  const {
    data: curations,
    isLoading,
    isError,
    refetch,
  } = useHomeCurationsQuery();

  if (!isLoading && !isError && (!curations || curations.length === 0)) {
    return null;
  }

  return (
    <section aria-label="에디터 추천" className="space-y-14">
      <HomeSectionHeader
        label={SECTION_LABEL}
        title={SECTION_TITLE}
        moreHref={ROUTES.CURATION.BASE}
        onMoreClick={() =>
          trackGA4Event('home_more_click', { section: 'curation' })
        }
      />
      {isLoading && (
        <div className="flex gap-12 overflow-hidden px-20" aria-busy="true">
          <SkeletonBase width={260} height={240} />
          <SkeletonBase width={260} height={240} />
        </div>
      )}
      {isError && <HomeFeaturedErrorState onRetry={() => refetch()} />}
      {curations && curations.length > 0 && (
        <ul className="flex gap-12 overflow-x-auto px-20 scrollbar-hide">
          {curations.map((curation, index) => (
            <li key={curation.id} className="w-260 shrink-0">
              <HomeCurationCard
                curation={curation}
                position={index + 1}
                priority={index === 0}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface CardProps {
  curation: CurationV2FeedItem;
  position: number;
  priority: boolean;
}

function HomeCurationCard({ curation, position, priority }: CardProps) {
  return (
    <Link
      href={ROUTES.CURATION.DETAIL(curation.id)}
      onClick={() =>
        trackGA4Event('home_item_click', {
          section: 'curation',
          item_id: String(curation.id),
          position,
        })
      }
      className="flex flex-col gap-8 text-fg-neutral"
    >
      <span className="relative block h-170 w-260 overflow-hidden bg-bg-neutral-weak">
        <BaseImage
          src={curation.coverImageUrl}
          alt=""
          fill
          priority={priority}
          sizes="260px"
          className="object-cover"
        />
        <span className="absolute left-10 top-10 bg-palette-static-white px-8 text-11 font-bold leading-22 text-palette-neutral-900">
          {CURATION_FEED_KIND_LABEL[getCurationFeedKind(curation)]}
        </span>
      </span>
      <span className="line-clamp-1 text-16 font-bold leading-22">
        {curation.name}
      </span>
      <span className="line-clamp-2 text-13 leading-19 text-fg-neutral-muted">
        {curation.description}
      </span>
    </Link>
  );
}
