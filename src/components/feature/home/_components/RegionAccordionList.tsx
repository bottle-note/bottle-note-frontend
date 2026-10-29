'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useRegionsQuery } from '@/queries/useRegionsQuery';
import { groupRegions } from '@/utils/regionGrouper';
import { getRegionFlagUrl } from '@/constants/regionFlags';
import type { RegionGroup } from '@/utils/regionGrouper';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import SkeletonList from '@/components/ui/Loading/Skeletons/SkeletonList';
import SemanticIcon from '@/components/ui/Display/SemanticIcon';
import AnimatedCollapse from '@/components/ui/Display/AnimatedCollapse';
import { trackGA4Event } from '@/utils/analytics/ga4';

const buildRegionHref = (regionId: number | '') =>
  `/explore?regionIds=${regionId}&tab=EXPLORER_WHISKEY`;

function RegionRowContent({
  group,
  imageUrl,
  fallbackImageUrl,
}: {
  group: RegionGroup;
  imageUrl: string | null;
  fallbackImageUrl: string;
}) {
  const [currentImageUrl, setCurrentImageUrl] = useState(
    () => imageUrl || fallbackImageUrl || '/bottle.svg',
  );

  useEffect(() => {
    setCurrentImageUrl(imageUrl || fallbackImageUrl || '/bottle.svg');
  }, [imageUrl, fallbackImageUrl]);

  const handleImageError = () => {
    setCurrentImageUrl((previousImageUrl) => {
      if (
        previousImageUrl === fallbackImageUrl ||
        previousImageUrl === '/bottle.svg'
      ) {
        return '/bottle.svg';
      }

      return fallbackImageUrl || '/bottle.svg';
    });
  };

  const isBottleFallback = currentImageUrl === '/bottle.svg';

  return (
    <span className="flex min-w-0 flex-1 items-center gap-14">
      <Image
        src={currentImageUrl}
        alt=""
        width={28}
        height={28}
        onError={handleImageError}
        className={`h-28 w-28 shrink-0 rounded-lg ${
          isBottleFallback
            ? 'bg-palette-static-white object-cover p-4'
            : 'bg-palette-static-white object-contain p-2'
        }`}
      />
      <span className="flex min-w-0 items-baseline gap-6">
        <span className="text-16 font-bold text-fg-neutral">
          {group.displayName}
        </span>
        <span className="truncate text-12 text-fg-neutral-muted">
          {group.engName}
        </span>
      </span>
    </span>
  );
}

const trackRegionClick = (regionId: number | '', position: number) =>
  trackGA4Event('home_item_click', {
    section: 'region',
    item_id: String(regionId),
    position,
  });

function RegionRow({
  group,
  position,
  isOpen,
  onToggle,
}: {
  group: RegionGroup;
  position: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const imageUrl = group.parent.imageUrl;
  const fallbackImageUrl = getRegionFlagUrl(group.parent.engName);
  const hasChildren = group.children.length > 0;

  if (!hasChildren) {
    return (
      <li className="border-b border-stroke-neutral-basement">
        <Link
          href={buildRegionHref(group.parent.regionId)}
          onClick={() => trackRegionClick(group.parent.regionId, position)}
          className="flex min-h-64 w-full items-center gap-14"
        >
          <RegionRowContent
            group={group}
            imageUrl={imageUrl}
            fallbackImageUrl={fallbackImageUrl}
          />
          <ArrowUpRight
            aria-hidden
            size={16}
            className="shrink-0 text-fg-neutral-muted"
          />
        </Link>
      </li>
    );
  }

  return (
    <li className="border-b border-stroke-neutral-basement">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={`${group.displayName} 하위 지역 ${isOpen ? '접기' : '펼치기'}`}
        className="flex min-h-64 w-full items-center gap-14 text-left"
      >
        <RegionRowContent
          group={group}
          imageUrl={imageUrl}
          fallbackImageUrl={fallbackImageUrl}
        />
        <SemanticIcon
          src="/icon/arrow-down-gray.svg"
          width={20}
          height={20}
          className={`shrink-0 text-fg-neutral-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatedCollapse isOpen={isOpen}>
        <ul className="flex flex-wrap gap-8 pb-18 pl-42">
          <li>
            <Link
              href={buildRegionHref(group.parent.regionId)}
              onClick={() => trackRegionClick(group.parent.regionId, position)}
              className="block rounded-full bg-bg-neutral-solid px-14 text-13 font-semibold leading-34 text-fg-neutral-inverted"
            >
              전체
            </Link>
          </li>
          {group.children.map((child) => (
            <li key={child.regionId}>
              <Link
                href={buildRegionHref(child.regionId)}
                onClick={() => trackRegionClick(child.regionId, position)}
                className="block rounded-full border border-stroke-neutral-subtle px-14 text-13 leading-32 text-fg-neutral"
              >
                {child.korName.replace(`${group.displayName}/`, '')}
              </Link>
            </li>
          ))}
        </ul>
      </AnimatedCollapse>
    </li>
  );
}

export default function RegionAccordionList() {
  const { regions, isLoading } = useRegionsQuery();
  const [openRegionId, setOpenRegionId] = useState<number | '' | null>(null);
  const initializedRef = useRef(false);

  const regionGroups = useMemo(() => groupRegions(regions), [regions]);

  useEffect(() => {
    if (initializedRef.current) return;
    if (regionGroups.length === 0) return;

    const scotland = regionGroups.find((g) => g.parent.engName === 'Scotland');
    if (scotland) {
      setOpenRegionId(scotland.parent.regionId);
      initializedRef.current = true;
    }
  }, [regionGroups]);

  if (isLoading) {
    return (
      <SkeletonList count={8} gap={0}>
        <div className="flex min-h-64 items-center gap-14 border-b border-stroke-neutral-basement">
          <SkeletonBase width={28} height={28} borderRadius="8px" />
          <SkeletonBase width={80} height={16} />
        </div>
      </SkeletonList>
    );
  }

  return (
    <ul>
      {regionGroups.map((group, index) => (
        <RegionRow
          key={group.parent.regionId}
          group={group}
          position={index + 1}
          isOpen={openRegionId === group.parent.regionId}
          onToggle={() =>
            setOpenRegionId((prev) =>
              prev === group.parent.regionId ? null : group.parent.regionId,
            )
          }
        />
      ))}
    </ul>
  );
}
