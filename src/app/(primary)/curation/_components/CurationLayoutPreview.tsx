'use client';

import Image from 'next/image';
import { Search } from 'lucide-react';
import { useTab } from '@/hooks/useTab';
import { useTastingEventsQuery } from '@/queries/useTastingEventsQuery';
import Tab from '@/components/ui/Navigation/Tab';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import type { TastingEventFeedItem } from '@/api/curation-v2/types';

type CurationTabId = 'CURATION' | 'TASTING_EVENT';

const tabList = [
  { name: '큐레이션', id: 'CURATION' },
  { name: '시음회', id: 'TASTING_EVENT' },
] satisfies { name: string; id: CurationTabId }[];

const curationCards = [
  {
    title: '비 오는 날 위스키',
    description: '오늘 분위기에 어울리는 보틀노트 추천 위스키',
    eyebrow: 'CURATION',
    imageUrl:
      'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=900',
    chips: ['향', '맛', '분위기'],
  },
  {
    title: '입문자를 위한 싱글 몰트',
    description: '향과 맛의 밸런스를 기준으로 고른 큐레이션',
    eyebrow: 'RECOMMENDED',
    imageUrl:
      'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=900',
    chips: ['싱글 몰트', '입문', '추천'],
  },
];

function CurationSearchField() {
  return (
    <div className="px-5 pt-[27px] pb-7">
      <button
        type="button"
        className="flex w-full items-center justify-between border-b border-subCoral pb-2 text-left"
      >
        <span className="text-13 font-medium text-brightGray">
          키워드를 입력하세요
        </span>
        <Search size={18} className="text-subCoral" aria-hidden />
      </button>
    </div>
  );
}

interface PreviewCardProps {
  chips: string[];
  description: string;
  eyebrow: string;
  imageUrl: string;
  title: string;
}

function PreviewCard({
  chips,
  description,
  eyebrow,
  imageUrl,
  title,
}: PreviewCardProps) {
  return (
    <article className="relative h-[390px] overflow-hidden rounded-[10px] bg-sectionWhite shadow-[0_3px_10px_rgba(0,0,0,0.12)]">
      <Image
        src={imageUrl}
        alt=""
        fill
        sizes="(max-width: 468px) 333px, 468px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/15 to-black/70" />
      <div className="absolute left-4 right-4 top-5">
        <span className="inline-flex rounded-full bg-white/30 px-3 py-1 text-10 font-bold text-white backdrop-blur-sm">
          {eyebrow}
        </span>
      </div>
      <div className="absolute bottom-5 left-4 right-4 rounded-[14px] bg-white/85 px-4 py-4 backdrop-blur-sm">
        <h2 className="text-20 font-extrabold text-mainBlack">{title}</h2>
        <p className="mt-2 text-13 font-medium leading-[18px] text-mainGray">
          {description}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {chips.map((label) => (
            <span
              key={label}
              className="truncate rounded-full bg-sectionWhite px-2 py-1 text-center text-11 font-medium text-subCoral"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function formatEntryFee(entryFee: number) {
  if (entryFee === 0) {
    return '무료';
  }

  return `${entryFee.toLocaleString('ko-KR')}원`;
}

function toTastingEventCard(event: TastingEventFeedItem): PreviewCardProps {
  const { payload } = event;
  const eventDateTime = [payload.eventDate, payload.eventTime]
    .filter(Boolean)
    .join(' ');

  return {
    title: event.name,
    description: payload.guideText || event.description,
    eyebrow: payload.isRecruiting ? '모집중' : '마감',
    imageUrl: event.coverImageUrl,
    chips: [
      eventDateTime,
      formatEntryFee(payload.entryFee),
      payload.barAddress,
    ],
  };
}

function TastingEventCardList() {
  const { data, isLoading, isError } = useTastingEventsQuery();

  if (isLoading) {
    return (
      <div className="px-5 pb-navbar">
        <div className="h-[390px] animate-pulse rounded-[10px] bg-sectionWhite" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="px-5 pb-navbar text-13 font-medium text-mainGray">
        시음회 정보를 불러오지 못했어요.
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="px-5 pb-navbar text-13 font-medium text-mainGray">
        진행 중인 시음회가 없어요.
      </p>
    );
  }

  return (
    <div className="space-y-[27px] px-5 pb-navbar">
      {data.map((event) => (
        <PreviewCard key={event.id} {...toTastingEventCard(event)} />
      ))}
    </div>
  );
}

function CurationCardList({ currentTab }: { currentTab: CurationTabId }) {
  if (currentTab === 'TASTING_EVENT') {
    return <TastingEventCardList />;
  }

  return (
    <div className="space-y-[27px] px-5 pb-navbar">
      {curationCards.map((card) => (
        <PreviewCard key={card.title} {...card} />
      ))}
    </div>
  );
}

export function CurationLayoutPreview() {
  const { currentTab, handleTab, refs, registerTab } = useTab({
    tabList,
    scroll: true,
    initialTab: tabList[0],
  });

  return (
    <>
      <div className="fixed-content top-0 z-10 items-center justify-center bg-white">
        <SubHeader>
          <SubHeader.Left>
            <SubHeader.Logo />
          </SubHeader.Left>
          <SubHeader.Right>
            <SubHeader.Menu />
          </SubHeader.Right>
        </SubHeader>
        <Tab
          variant="bookmark"
          tabList={tabList}
          handleTab={handleTab}
          currentTab={currentTab}
          scrollContainerRef={refs.scrollContainerRef}
          registerTab={registerTab}
        />
      </div>
      <section
        className="w-full bg-white"
        style={{
          marginTop: 'calc(var(--header-height-with-safe) + var(--tab-height))',
        }}
      >
        <CurationSearchField />
        <CurationCardList currentTab={currentTab.id} />
      </section>
    </>
  );
}
