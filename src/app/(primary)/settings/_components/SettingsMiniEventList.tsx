'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

const EVENT_NAME_MAX_LENGTH = 6;

interface MiniEvent {
  id: string;
  name: string;
  thumbnailUrl: string;
  targetUrl: string;
  isActive: boolean;
  prefetch?: boolean;
}

const MINI_EVENTS: MiniEvent[] = [
  {
    id: 'whiskey-mbti',
    name: '위스키 MBTI',
    thumbnailUrl: '/images/whiskey-mbti/thumbnail.webp',
    targetUrl: ROUTES.WHISKEY_MBTI,
    isActive: true,
    prefetch: false,
  },
  {
    id: 'whiskey-tarot',
    name: '위스키 타로',
    thumbnailUrl: '/images/tarot/card-back.png',
    targetUrl: ROUTES.WHISKEY_TAROT,
    isActive: true,
  },
];

export const truncateMiniEventName = (name: string) => {
  if (name.length <= EVENT_NAME_MAX_LENGTH) return name;

  return `${name.slice(0, EVENT_NAME_MAX_LENGTH)}...`;
};

interface SettingsMiniEventListProps {
  events?: MiniEvent[];
}

export function SettingsMiniEventList({
  events = MINI_EVENTS,
}: SettingsMiniEventListProps) {
  const activeEvents = events.filter((event) => event.isActive);

  if (activeEvents.length === 0) return null;

  return (
    <section className="border-b border-stroke-neutral-subtle py-[22px]">
      <ul className="grid grid-cols-4 gap-x-3 gap-y-4">
        {activeEvents.map((event) => (
          <li key={event.id}>
            <Link
              href={event.targetUrl}
              prefetch={event.prefetch}
              className="flex flex-col items-center gap-2"
              aria-label={event.name}
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-palette-static-white">
                {event.id === 'whiskey-mbti' && (
                  <span className="pointer-events-none absolute left-0 top-0 z-10 rounded-br-md bg-bg-brand-solid px-1 py-0.5 text-9 font-bold leading-none text-fg-brand-contrast">
                    NEW
                  </span>
                )}
                <Image
                  src={event.thumbnailUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <span className="w-full text-center text-12 font-medium leading-none text-fg-neutral">
                {truncateMiniEventName(event.name)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
