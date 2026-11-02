'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  ChevronRight,
  PenLine,
  Search,
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
}

const QUICK_LINKS: QuickLinkItem[] = [
  {
    id: 'whisky_search',
    label: '위스키 검색',
    href: ROUTES.EXPLORE.WHISKEY_SEARCH_FOCUSED,
    Icon: Search,
  },
  {
    id: 'review_write',
    label: '리뷰 쓰기',
    href: ROUTES.REVIEW.REGISTER_BASE,
    Icon: PenLine,
  },
  {
    id: 'my_records',
    label: '나의 기록',
    href: ROUTES.HISTORY.BASE,
    Icon: BookOpen,
  },
];

const trackQuickLink = (link: HomeQuickLink) =>
  trackGA4Event('home_quick_link_click', { link });

export default function HomeQuickLinks() {
  return (
    <nav aria-label="바로 가기" className="flex flex-col gap-16 px-20 pt-18">
      {/* 새 기능인 바텐더 노트만 캐릭터 이미지가 든 카드로 크게 보여 준다 */}
      <Link
        href={ROUTES.BARTENDER_NOTE}
        prefetch={false}
        onClick={() => trackQuickLink('bartender_note')}
        className="flex items-center gap-14 rounded-lg bg-bg-neutral-weak py-10 pl-10 pr-14 text-fg-neutral"
      >
        <Image
          src="/images/home/quick-link-bartender-note.webp"
          alt=""
          width={56}
          height={56}
          className="h-56 w-56 shrink-0 rounded-md object-cover"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="flex items-center gap-6">
            <span className="text-15 font-bold">바텐더 노트</span>
            <span className="rounded-full bg-bg-brand-solid px-5 text-10 font-bold leading-16 text-fg-brand-contrast">
              NEW
            </span>
          </span>
          <span className="break-keep text-13 text-fg-neutral-muted">
            취향에 맞는 위스키를 찾아 드려요
          </span>
        </span>
        <ChevronRight
          aria-hidden
          size={20}
          strokeWidth={1.6}
          className="shrink-0 text-fg-neutral-muted"
        />
      </Link>
      <ul className="grid grid-cols-3">
        {QUICK_LINKS.map(({ id, label, href, Icon }) => (
          <li key={id}>
            <Link
              href={href}
              prefetch={false}
              onClick={() => trackQuickLink(id)}
              className="group flex flex-col items-center gap-8 text-fg-neutral"
            >
              <span className="flex h-48 w-48 items-center justify-center rounded-full bg-bg-neutral-weak transition-colors group-hover:bg-bg-brand-weak">
                <Icon aria-hidden size={24} strokeWidth={1.6} />
              </span>
              <span className="text-12 font-semibold">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
