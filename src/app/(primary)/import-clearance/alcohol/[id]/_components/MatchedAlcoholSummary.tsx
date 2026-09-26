import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { AlcoholInfo } from '@/api/alcohol/types';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import Label from '@/components/ui/Display/Label';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import { ROUTES } from '@/constants/routes';
import { trackGA4Event } from '@/utils/analytics/ga4';

interface Props {
  alcohol: AlcoholInfo;
  declarationId: number;
}

export function MatchedAlcoholSummary({ alcohol, declarationId }: Props) {
  const region = alcohol.korRegion.split('/').filter(Boolean).slice(-1)[0];
  const abv = alcohol.abv
    ? alcohol.abv.includes('%')
      ? alcohol.abv
      : `${alcohol.abv}%`
    : null;
  const metadata = [alcohol.korCategory, region, abv]
    .filter(Boolean)
    .join(' · ');
  const flavorTags = (alcohol.alcoholsTastingTags ?? []).slice(0, 4);

  return (
    <section className="mx-20 flex flex-col gap-12 border-b border-stroke-neutral-subtle py-20">
      <h2 className="text-12 font-bold tracking-wide text-fg-neutral-subtle">
        보틀노트 매칭
      </h2>

      <div className="flex items-start gap-16">
        <AlcoholImage
          imageUrl={alcohol.alcoholUrlImg}
          outerHeightClass="h-104"
          outerWidthClass="w-104"
          innerHeightClass="h-84"
          innerWidthClass="w-84"
          rounded="rounded-xl"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-8 py-4">
          <div className="space-y-4">
            <h3 className="break-words text-16 font-bold text-fg-neutral">
              {alcohol.korName}
            </h3>
            <p className="break-words text-11 text-fg-neutral-muted">
              {alcohol.engName.toUpperCase()}
            </p>
          </div>
          {metadata && (
            <p className="break-words text-12 text-fg-neutral-muted">
              {metadata}
            </p>
          )}
          {flavorTags.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {flavorTags.map((tag) => (
                <Label
                  key={tag}
                  name={tag}
                  styleClass="label-default whitespace-nowrap px-8 py-4 text-11"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {alcohol.description && (
        <p className="line-clamp-3 text-12 font-normal leading-relaxed text-fg-neutral-muted">
          {alcohol.description}
        </p>
      )}
      <Link
        href={ROUTES.SEARCH.ALL(alcohol.alcoholId)}
        className="inline-flex items-center gap-4 self-start text-12 font-medium text-fg-neutral-subtle"
        onClick={() =>
          trackGA4Event('select_import_clearance_alcohol', {
            declaration_id: String(declarationId),
            alcohol_id: String(alcohol.alcoholId),
            source: 'summary',
          })
        }
      >
        보틀노트 정보
        <ChevronRight size={14} aria-hidden />
      </Link>
    </section>
  );
}

export function MatchedAlcoholSummarySkeleton() {
  return (
    <section className="mx-20 flex flex-col gap-12 border-b border-stroke-neutral-subtle py-20">
      <SkeletonBase width={90} height={16} />
      <div className="flex gap-16">
        <SkeletonBase width={104} height={104} borderRadius="12px" />
        <div className="min-w-0 flex-1 space-y-12 py-4">
          <SkeletonBase width="90%" height={18} />
          <SkeletonBase width="75%" height={12} />
          <SkeletonBase width="85%" height={12} />
          <SkeletonBase width="100%" height={28} borderRadius="8px" />
        </div>
      </div>
      <div className="space-y-8">
        <SkeletonBase width="100%" height={12} />
        <SkeletonBase width="100%" height={12} />
        <SkeletonBase width="70%" height={12} />
      </div>
    </section>
  );
}
