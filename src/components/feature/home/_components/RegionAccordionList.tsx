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
    <li className="py-[14px] px-[10px] border border-bgGray rounded-xl flex flex-col gap-[10px]">
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-[10px]">
          <Image
            src={flagUrl || '/bottle.svg'}
            alt={group.displayName}
            width={26}
            height={26}
            className={`w-[26px] h-[26px] object-cover ${flagUrl ? 'rounded-lg' : 'rounded-lg bg-sectionWhite p-1'}`}
          />
          <div className="gap-[4px] flex items-center">
            <span className="text-13 font-extrabold text-mainDarkGray">
              {group.displayName}
            </span>
            <span className="text-11  text-mainDarkGray">{group.engName}</span>
          </div>
        </div>
        {hasChildren && (
          <button className="p-1">
            <Image
              src="/icon/arrow-down-darkgray.svg"
              alt=""
              width={16}
              height={16}
              className={`transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </button>

      {isOpen && hasChildren && (
        <div className="px-[8px] flex flex-col gap-[10px]">
          {/* /전체 항목 */}
          <Link
            href={`/search?regionId=${group.parent.regionId}`}
            className="flex items-center justify-between py-[8px] border-b border-bgGray border-dashed"
          >
            <span className="text-13 font-bold text-mainDarkGray">
              {group.parent.korName}
            </span>
          </Link>

          {/* 하위 지역들 */}
          {group.children.map((child) => (
            <div key={child.regionId}>
              <Link
                href={`/search?regionId=${child.regionId}`}
                className="flex items-center justify-between py-[8px] border-b border-bgGray border-dashed"
              >
                <div className="gap-[4px] flex items-center">
                  <span className="text-13 font-bold text-mainDarkGray">
                    {child.korName}
                  </span>
                  <span className="text-11  text-mainDarkGray">
                    {child.engName}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

export default function RegionAccordionList() {
  const { regions, isLoading } = useRegionsQuery();
  const [openRegionId, setOpenRegionId] = useState<number | '' | null>(null);

  if (isLoading) {
    return <div className="min-h-[60vh]" />;
  }

  const regionGroups = groupRegions(regions);

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
