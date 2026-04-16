'use client';

import HomeFeaturedList from '@/components/feature/home/HomeFeaturedList';
import HomeTabSection from '@/components/feature/home/HomeTabSection';
import type { HomeFeaturedConfigKey } from '@/constants/home';

interface FeaturedMenuItem {
  id: HomeFeaturedConfigKey;
  name: string;
}

const TAB_LIST: FeaturedMenuItem[] = [
  { id: 'view-week', name: '주간 TOP 5' },
  { id: 'recent', name: '최근에 본 위스키' },
];

export default function HomeFeaturedSection() {
  return (
    <HomeTabSection
      tabList={TAB_LIST}
      scroll
      contentClassName="pb-[59px] pl-[25px]"
    >
      {(currentTab) => (
        <HomeFeaturedList key={currentTab.id} type={currentTab.id} />
      )}
    </HomeTabSection>
  );
}
