'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, type LucideIcon } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { trackGA4Event } from '@/utils/analytics/ga4';
import type { HomeQuickLink } from '@/utils/analytics/types';

type QuickLinkVisual = { image: string } | { Icon: LucideIcon };

type QuickLinkItem = {
  id: HomeQuickLink;
  label: string;
  href: string;
  isNew?: boolean;
} & QuickLinkVisual;

const QUICK_LINKS: QuickLinkItem[] = [
  {
    id: 'bartender_note',
    label: '바텐더 노트',
    href: ROUTES.BARTENDER_NOTE,
    image: '/images/home/quick-link-bartender-note.webp',
    isNew: true,
  },
  {
    id: 'taste_test',
    label: '취향 테스트',
    href: ROUTES.WHISKEY_MBTI,
    image: '/images/home/quick-link-taste-test.webp',
  },
  {
    id: 'tarot',
    label: '위스키 타로',
    href: ROUTES.WHISKEY_TAROT,
    image: '/images/home/quick-link-tarot.webp',
  },
  {
    id: 'whisky_search',
    label: '위스키 검색',
    href: ROUTES.EXPLORE.WHISKEY_SEARCH_FOCUSED,
    Icon: Search,
  },
];

function QuickLinkTile(item: QuickLinkItem) {
  if ('image' in item) {
    return (
      <Image
        src={item.image}
        alt=""
        width={64}
        height={64}
        className="h-full w-full object-cover"
      />
    );
  }

  const { Icon } = item;
  return (
    <span className="flex h-full w-full items-center justify-center bg-bg-neutral-weak text-fg-brand">
      <Icon aria-hidden size={28} strokeWidth={1.6} />
    </span>
  );
}

export default function HomeQuickLinks() {
  return (
    <nav aria-label="바로 가기" className="px-20 pt-18">
      <ul className="grid grid-cols-4">
        {QUICK_LINKS.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              prefetch={false}
              onClick={() =>
                trackGA4Event('home_quick_link_click', { link: item.id })
              }
              className="group relative flex flex-col items-center gap-8 text-fg-neutral"
            >
              <span className="h-64 w-64 overflow-hidden rounded-2xl transition-opacity group-hover:opacity-90">
                <QuickLinkTile {...item} />
              </span>
              <span className="text-12 font-semibold">{item.label}</span>
              {item.isNew && (
                <span className="absolute -top-6 left-1/2 ml-16 rounded-full bg-bg-brand-solid px-5 text-10 font-bold leading-16 text-fg-brand-contrast">
                  NEW
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
