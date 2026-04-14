'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRegionsQuery } from '@/queries/useRegionsQuery';
import { groupRegions } from '@/utils/regionGrouper';
import { getRegionFlagUrl } from '@/constants/regionFlags';
import type { RegionGroup } from '@/utils/regionGrouper';

function RegionRow({
  group,
  isOpen,
  onToggle,
}: {
  group: RegionGroup;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const flagUrl = getRegionFlagUrl(group.parent.engName);
  const hasChildren = group.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      onToggle();
    } else {
      router.push(`/search?regionId=${group.parent.regionId}`);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center justify-between px-5 py-[9px]"
      >
        <div className="flex items-center gap-[10px]">
          <Image
            src={flagUrl || '/bottle.svg'}
            alt={group.displayName}
            width={26}
            height={26}
            className={`w-[26px] h-[26px] object-cover ${flagUrl ? 'rounded-full' : 'rounded-full bg-sectionWhite p-1'}`}
          />
          <span className="text-13 font-extrabold text-mainDarkGray">
            {group.displayName}
          </span>
        </div>
        {hasChildren && (
          <Image
            src="/icon/arrow-right-subcoral.svg"
            alt=""
            width={22}
            height={22}
            className={`transition-transform duration-200 ${
              isOpen ? 'rotate-90' : ''
            }`}
          />
        )}
      </button>

      {isOpen && hasChildren && (
        <div className="mx-5 ml-[61px] pb-2">
          {/* /전체 항목 */}
          <Link
            href={`/search?regionId=${group.parent.regionId}`}
            className="flex items-center justify-between py-[8px]"
          >
            <span className="text-13 font-bold text-mainDarkGray">
              {group.parent.korName}
            </span>
          </Link>
          <div className="border-b border-sectionWhite" />

          {/* 하위 지역들 */}
          {group.children.map((child) => (
            <div key={child.regionId}>
              <Link
                href={`/search?regionId=${child.regionId}`}
                className="flex items-center justify-between py-[8px]"
              >
                <span className="text-13 font-bold text-mainDarkGray">
                  {child.korName}
                </span>
              </Link>
              <div className="border-b border-sectionWhite" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RegionAccordionList() {
  const { regions, isLoading } = useRegionsQuery();
  const [openRegionId, setOpenRegionId] = useState<number | '' | null>(null);

  if (isLoading) {
    return (
      <div className="px-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[44px] bg-sectionWhite rounded animate-pulse"
          />
        ))}
      </div>
    );
  }

  const regionGroups = groupRegions(regions);

  return (
    <div>
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
    </div>
  );
}
