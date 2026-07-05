'use client';

import HomeFeaturedList from '@/components/feature/home/HomeFeaturedList';
import HomeTabSection from '@/components/feature/home/HomeTabSection';
import HomeTastingEventPreview from '@/components/feature/home/HomeTastingEventPreview';
import type { HomeFeaturedConfigKey } from '@/constants/home';

type HomeFeaturedTabId = HomeFeaturedConfigKey | 'tasting-event';

interface FeaturedMenuItem {
  id: HomeFeaturedTabId;
  name: string;
}

const TAB_LIST: FeaturedMenuItem[] = [
  { id: 'view-week', name: '주간 TOP 5' },
  { id: 'recent', name: '최근에 본 위스키' },
  { id: 'tasting-event', name: '시음회' },
];

export default function HomeFeaturedSection() {
  return (
    <HomeTabSection
      tabList={TAB_LIST}
      scroll
      contentClassName="pb-[59px] pl-[25px]"
    >
      {(currentTab) => (
        <>
          {currentTab.id === 'tasting-event' ? (
            <HomeTastingEventPreview key={currentTab.id} />
          ) : (
            <HomeFeaturedList key={currentTab.id} type={currentTab.id} />
          )}
        </>
      )}
    </HomeTabSection>
  );
}
