'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { LinkData } from '@/types/LinkButton';
import {
  buildWhiskeyExploreCategoryHref,
  getFilteredCategories,
  generateMenu,
} from '@/utils/categoryUtils';
import { trackGA4Event } from '@/utils/analytics/ga4';

const ALL_CATEGORY: LinkData = {
  engName: 'All',
  korName: '전체',
  linkSrc: buildWhiskeyExploreCategoryHref(),
};

function CategoryList() {
  const menu: LinkData[] = [
    ...generateMenu(getFilteredCategories()),
    ALL_CATEGORY,
  ];

  return (
    <ul>
      {menu.map((data, index) => (
        <li
          key={data.engName}
          className="border-b border-stroke-neutral-basement"
        >
          <Link
            href={data.linkSrc}
            onClick={() =>
              trackGA4Event('home_item_click', {
                section: 'category',
                item_id: data.engName,
                position: index + 1,
              })
            }
            className="flex min-h-68 items-center gap-14 text-fg-neutral"
          >
            <span className="w-24 shrink-0 text-13 font-semibold text-fg-neutral-muted">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="text-16 font-bold">{data.korName}</span>
              <span className="text-12 text-fg-neutral-muted">
                {data.engName}
              </span>
            </span>
            {data.imgSrc && (
              <Image
                src={data.imgSrc}
                alt=""
                width={40}
                height={56}
                className="h-56 w-40 object-contain"
              />
            )}
            <ArrowUpRight
              aria-hidden
              size={16}
              className="shrink-0 text-fg-neutral-muted"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default CategoryList;
