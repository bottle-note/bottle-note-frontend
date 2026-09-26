'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRegionsQuery } from '@/queries/useRegionsQuery';
import { groupRegions } from '@/utils/regionGrouper';
import { getRegionFlagUrl } from '@/constants/regionFlags';
import type { RegionGroup } from '@/utils/regionGrouper';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import SkeletonList from '@/components/ui/Loading/Skeletons/SkeletonList';
import SemanticIcon from '@/components/ui/Display/SemanticIcon';
import AnimatedCollapse from '@/components/ui/Display/AnimatedCollapse';

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
    <div className="flex items-center gap-10">
      <Image
        src={currentImageUrl}
        alt={group.displayName}
        width={26}
        height={26}
        onError={handleImageError}
        className={`w-26 h-26 rounded-lg ${
          isBottleFallback
            ? 'bg-palette-static-white object-cover p-4'
            : 'bg-palette-static-white object-contain p-2'
        }`}
      />
      <div className="gap-4 flex items-center">
        <span className="text-13 font-extrabold text-fg-neutral">
          {group.displayName}
        </span>
        <span className="text-11 text-fg-neutral-muted">{group.engName}</span>
      </div>
    </div>
  );
}

function RegionRow({
  group,
  isOpen,
  onToggle,
}: {
  group: RegionGroup;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const imageUrl = group.parent.imageUrl;
  const fallbackImageUrl = getRegionFlagUrl(group.parent.engName);
  const hasChildren = group.children.length > 0;

  if (!hasChildren) {
    return (
      <li className="rounded-xl border border-stroke-neutral-basement px-10 py-14">
        <Link
          href={buildRegionHref(group.parent.regionId)}
          className="flex w-full items-center justify-between"
        >
          <RegionRowContent
            group={group}
            imageUrl={imageUrl}
            fallbackImageUrl={fallbackImageUrl}
          />
        </Link>
      </li>
    );
  }

  return (
    <li className="flex flex-col rounded-xl border border-stroke-neutral-basement px-10 py-14">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={`${group.displayName} 하위 지역 ${isOpen ? '접기' : '펼치기'}`}
        className="flex w-full items-center justify-between"
      >
        <RegionRowContent
          group={group}
          imageUrl={imageUrl}
          fallbackImageUrl={fallbackImageUrl}
        />
        <SemanticIcon
          src="/icon/arrow-down-gray.svg"
          width={22}
          height={22}
          className={`text-fg-neutral-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatedCollapse isOpen={isOpen}>
        <ul className="flex flex-col gap-10 px-8 pt-10">
          {/* /전체 항목 */}
          <li>
            <Link
              href={buildRegionHref(group.parent.regionId)}
              className="flex items-center justify-between border-b border-dashed border-stroke-neutral-basement py-8"
            >
              <span className="text-13 font-bold text-fg-neutral">
                {group.parent.korName}
              </span>
            </Link>
          </li>

          {/* 하위 지역들 */}
          {group.children.map((child) => (
            <li key={child.regionId}>
              <Link
                href={buildRegionHref(child.regionId)}
                className="flex items-center justify-between border-b border-dashed border-stroke-neutral-basement py-8"
              >
                <div className="gap-4 flex items-center">
                  <span className="text-13 font-bold text-fg-neutral">
                    {child.korName}
                  </span>
                  <span className="text-11 text-fg-neutral-muted">
                    {child.engName}
                  </span>
                </div>
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
      <SkeletonList count={8} gap={8}>
        <li className="flex items-center justify-between rounded-xl border border-stroke-neutral-basement px-10 py-14">
          <div className="flex items-center gap-10">
            <SkeletonBase width={26} height={26} borderRadius="8px" />
            <div className="flex items-center gap-4">
              <SkeletonBase width={56} height={14} />
            </div>
          </div>
        </li>
      </SkeletonList>
    );
  }

  return (
    <ul className="space-y-8">
      {regionGroups.map((group) => (
        <RegionRow
          key={group.parent.regionId}
          group={group}
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
