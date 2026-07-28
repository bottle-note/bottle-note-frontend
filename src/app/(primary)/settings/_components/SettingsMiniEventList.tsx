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
}

const MINI_EVENTS: MiniEvent[] = [
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
    <section className="border-b border-brightGray py-[22px]">
      <ul className="grid grid-cols-4 gap-x-3 gap-y-4">
        {activeEvents.map((event) => (
          <li key={event.id}>
            <Link
              href={event.targetUrl}
              className="flex flex-col items-center gap-2"
              aria-label={event.name}
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-brightGray">
                <Image
                  src={event.thumbnailUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <span className="w-full text-center text-12 font-medium leading-none text-mainBlack">
                {truncateMiniEventName(event.name)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
