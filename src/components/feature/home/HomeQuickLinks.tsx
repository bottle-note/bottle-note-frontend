'use client';

import Link from 'next/link';
import {
  GalleryVerticalEnd,
  Martini,
  NotebookPen,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { trackGA4Event } from '@/utils/analytics/ga4';
import type { HomeQuickLink } from '@/utils/analytics/types';

interface QuickLinkItem {
  id: HomeQuickLink;
  label: string;
  href: string;
  Icon: LucideIcon;
  isNew?: boolean;
}

const QUICK_LINKS: QuickLinkItem[] = [
  {
    id: 'bartender_note',
    label: '바텐더 노트',
    href: ROUTES.BARTENDER_NOTE,
    Icon: Martini,
    isNew: true,
  },
  {
    id: 'taste_test',
    label: '취향 테스트',
    href: ROUTES.WHISKEY_MBTI,
    Icon: SlidersHorizontal,
  },
  {
    id: 'tarot',
    label: '위스키 타로',
    href: ROUTES.WHISKEY_TAROT,
    Icon: GalleryVerticalEnd,
  },
  {
    id: 'my_records',
    label: '나의 기록',
    href: ROUTES.HISTORY.BASE,
    Icon: NotebookPen,
  },
];

export default function HomeQuickLinks() {
  return (
    <nav aria-label="바로 가기" className="px-20 pt-18">
      <ul className="grid grid-cols-4">
        {QUICK_LINKS.map(({ id, label, href, Icon, isNew }) => (
          <li key={id}>
            <Link
              href={href}
              prefetch={false}
              onClick={() =>
                trackGA4Event('home_quick_link_click', { link: id })
              }
              className="group relative flex flex-col items-center gap-8 text-fg-neutral"
            >
              <span className="flex h-48 w-48 items-center justify-center rounded-full transition-colors group-hover:bg-bg-brand-weak">
                <Icon aria-hidden size={24} strokeWidth={1.6} />
              </span>
              <span className="text-12 font-semibold">{label}</span>
              {isNew && (
                <span className="absolute -top-4 left-1/2 ml-12 rounded-full bg-bg-brand-solid px-5 text-10 font-bold leading-16 text-fg-brand-contrast">
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
