'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useRegionsQuery } from '@/queries/useRegionsQuery';
import { groupRegions } from '@/utils/regionGrouper';
import { getRegionFlagUrl } from '@/constants/regionFlags';
import type { RegionGroup } from '@/utils/regionGrouper';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import SkeletonList from '@/components/ui/Loading/Skeletons/SkeletonList';

const buildRegionHref = (regionId: number | '') =>
  `/explore?regionIds=${regionId}&tab=EXPLORER_WHISKEY`;

function RegionRowContent({
  group,
  flagUrl,
}: {
  group: RegionGroup;
  flagUrl: string;
}) {
  return (
    <div className="flex items-center gap-[10px]">
      <Image
        src={flagUrl || '/bottle.svg'}
        alt={group.displayName}
        width={26}
        height={26}
        className={`w-[26px] h-[26px] object-cover ${flagUrl ? 'rounded-lg' : 'rounded-lg bg-sectionWhite dark:bg-bn-section p-1'}`}
      />
      <div className="gap-[4px] flex items-center">
        <span className="text-13 font-extrabold text-mainDarkGray dark:text-bn-text">
          {group.displayName}
        </span>
        <span className="text-11 text-mainDarkGray dark:text-bn-text-secondary">
          {group.engName}
        </span>
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
  const flagUrl = getRegionFlagUrl(group.parent.engName);
  const hasChildren = group.children.length > 0;

  if (!hasChildren) {
    return (
      <li className="py-[14px] px-[10px] border border-bgGray dark:border-bn-border rounded-xl">
        <Link
          href={buildRegionHref(group.parent.regionId)}
          className="flex w-full items-center justify-between"
        >
          <RegionRowContent group={group} flagUrl={flagUrl} />
        </Link>
      </li>
    );
  }

  return (
    <li className="py-[14px] px-[10px] border border-bgGray dark:border-bn-border rounded-xl flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={`${group.displayName} 하위 지역 ${isOpen ? '접기' : '펼치기'}`}
        className="flex w-full items-center justify-between"
      >
        <RegionRowContent group={group} flagUrl={flagUrl} />
        <Image
          src="/icon/arrow-down-gray.svg"
          alt=""
          width={22}
          height={22}
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.ul
            key="content"
            initial={{ height: 0, marginTop: 0 }}
            animate={{ height: 'auto', marginTop: 10 }}
            exit={{ height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden px-[8px] flex flex-col gap-[10px]"
          >
            {/* /전체 항목 */}
            <li>
              <Link
                href={buildRegionHref(group.parent.regionId)}
                className="flex items-center justify-between py-[8px] border-b border-bgGray dark:border-bn-border border-dashed"
              >
                <span className="text-13 font-bold text-mainDarkGray dark:text-bn-text">
                  {group.parent.korName}
                </span>
              </Link>
            </li>

            {/* 하위 지역들 */}
            {group.children.map((child) => (
              <li key={child.regionId}>
                <Link
                  href={buildRegionHref(child.regionId)}
                  className="flex items-center justify-between py-[8px] border-b border-bgGray dark:border-bn-border border-dashed"
                >
                  <div className="gap-[4px] flex items-center">
                    <span className="text-13 font-bold text-mainDarkGray dark:text-bn-text">
                      {child.korName}
                    </span>
                    <span className="text-11 text-mainDarkGray dark:text-bn-text-secondary">
                      {child.engName}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
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
        <li className="py-[14px] px-[10px] border border-bgGray dark:border-bn-border rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <SkeletonBase width={26} height={26} borderRadius="8px" />
            <div className="flex items-center gap-[4px]">
              <SkeletonBase width={56} height={14} />
            </div>
          </div>
        </li>
      </SkeletonList>
    );
  }

  return (
    <ul className="space-y-[8px]">
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
