'use client';

import { useState } from 'react';
import Link from 'next/link';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import AlcoholPickButton from '@/components/domain/alcohol/AlcoholPickButton';
import Star from '@/components/ui/Display/Star';
import { ROUTES } from '@/constants/routes';
import useModalStore from '@/store/modalStore';
import { trackGA4Event } from '@/utils/analytics/ga4';
import type { HomeSection } from '@/utils/analytics/types';
import type { Alcohol } from '@/api/alcohol/types';

interface Props {
  items: Alcohol[];
  section: HomeSection;
  /** 순위 숫자(01, 02…)를 보여줄지 여부 */
  ranked?: boolean;
}

export function HomeRankList({ items, section, ranked = false }: Props) {
  return (
    <ol className="px-20">
      {items.map((item, index) => (
        <HomeRankItem
          key={item.alcoholId}
          item={item}
          position={index + 1}
          section={section}
          ranked={ranked}
        />
      ))}
    </ol>
  );
}

interface ItemProps {
  item: Alcohol;
  position: number;
  section: HomeSection;
  ranked: boolean;
}

function HomeRankItem({ item, position, section, ranked }: ItemProps) {
  const { handleLoginModal } = useModalStore();
  const [isPicked, setIsPicked] = useState(item.isPicked);
  const href = item.path ?? ROUTES.ALCOHOL.DETAIL(item.alcoholId);

  const handleSelect = () => {
    trackGA4Event('home_item_click', {
      section,
      item_id: String(item.alcoholId),
      position,
    });
  };

  return (
    <li className="flex items-center gap-14 border-b border-stroke-neutral-basement py-14">
      {ranked && (
        <span className="w-24 shrink-0 text-17 font-bold text-fg-brand-primary">
          {String(position).padStart(2, '0')}
        </span>
      )}
      <Link
        href={href}
        onClick={handleSelect}
        className="flex min-w-0 flex-1 items-center gap-14"
      >
        <span className="shrink-0 border border-stroke-neutral-basement">
          <AlcoholImage
            imageUrl={item.imageUrl}
            outerHeightClass="h-72"
            outerWidthClass="w-72"
            innerHeightClass="h-64"
            innerWidthClass="w-64"
            blendMode="mix-blend-multiply dark:mix-blend-normal"
            rounded="rounded-none"
          />
        </span>
        <span className="flex min-w-0 flex-col gap-4">
          <span className="text-15 font-bold leading-21 text-fg-neutral">
            {item.korName}
          </span>
          <span className="truncate text-11 text-fg-neutral-muted">
            {item.engName}
          </span>
          <Star rating={item.rating} size={16} tone="brand" />
        </span>
      </Link>
      <span className="flex h-44 w-44 shrink-0 items-center justify-center">
        <AlcoholPickButton
          isPicked={isPicked}
          alcoholId={item.alcoholId}
          alcoholName={item.korName}
          tone="neutral"
          size={20}
          source="home"
          handleUpdatePicked={() => setIsPicked((prev) => !prev)}
          onApiError={() => setIsPicked(item.isPicked)}
          handleNotLogin={handleLoginModal}
        />
      </span>
    </li>
  );
}
