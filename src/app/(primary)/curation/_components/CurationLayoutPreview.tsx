'use client';

import Image from 'next/image';
import { Search } from 'lucide-react';
import { useTab } from '@/hooks/useTab';
import Tab from '@/components/ui/Navigation/Tab';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';

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
  },
  {
    title: '입문자를 위한 싱글 몰트',
    description: '향과 맛의 밸런스를 기준으로 고른 큐레이션',
    eyebrow: 'RECOMMENDED',
    imageUrl:
      'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=900',
  },
];

const tastingEventCards = [
  {
    title: '6월의 시음회',
    description: '새로운 위스키를 함께 경험하는 시음회',
    eyebrow: 'TASTING',
    imageUrl:
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=900',
  },
  {
    title: '도심 속 위스키 클래스',
    description: '바에서 만나는 큐레이션 기반 시음 프로그램',
    eyebrow: 'EVENT',
    imageUrl:
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=900',
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
  description: string;
  eyebrow: string;
  imageUrl: string;
  title: string;
}

function PreviewCard({
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
          {['향', '맛', '분위기'].map((label) => (
            <span
              key={label}
              className="rounded-full bg-sectionWhite px-2 py-1 text-center text-11 font-medium text-subCoral"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function CurationCardList({ currentTab }: { currentTab: CurationTabId }) {
  const cards = currentTab === 'CURATION' ? curationCards : tastingEventCards;

  return (
    <div className="space-y-[27px] px-5 pb-navbar">
      {cards.map((card) => (
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
