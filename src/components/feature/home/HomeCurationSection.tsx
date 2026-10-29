'use client';

import Link from 'next/link';
import BaseImage from '@/components/ui/Display/BaseImage';
import {
  CURATION_V2_SPEC_CODES,
  type CurationV2SpecCode,
} from '@/api/curation-v2/constants';
import type { HomeCuration } from '@/app/(primary)/_utils/getHomeCurations';
import { ROUTES } from '@/constants/routes';
import { trackGA4Event } from '@/utils/analytics/ga4';

import HomeSectionHeader from './HomeSectionHeader';

const SECTION_LABEL = "EDITOR'S PICK";
const SECTION_TITLE = '보틀노트 에디터가 직접 골라봤어요✨';

const KIND_LABEL: Record<CurationV2SpecCode, string> = {
  [CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT]: '시음회',
  [CURATION_V2_SPEC_CODES.PROGRAM]: '프로그램',
  [CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY]: '큐레이션',
  [CURATION_V2_SPEC_CODES.WHISKY_PAIRING]: '페어링',
};

interface Props {
  curations: HomeCuration[];
}

/** 에디터 추천: 서버에서 미리 받은 시음회·프로그램·큐레이션·페어링을 가로로 넘기는 커버 카드. 비어 있으면 섹션을 숨긴다. */
export default function HomeCurationSection({ curations }: Props) {
  if (curations.length === 0) {
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
    </section>
  );
}

interface CardProps {
  curation: HomeCuration;
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
          {KIND_LABEL[curation.specCode]}
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
