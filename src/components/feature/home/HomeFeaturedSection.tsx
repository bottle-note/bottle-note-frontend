'use client';

import HomeFeaturedList from '@/components/feature/home/HomeFeaturedList';
import HomeTabSection from '@/components/feature/home/HomeTabSection';
import SectionHeader from '@/components/ui/Display/SectionHeader';
import { HOME_FEATURED_CONFIG } from '@/constants/home';
import type { HomeFeaturedConfigKey } from '@/constants/home';

interface FeaturedMenuItem {
  id: HomeFeaturedConfigKey;
  name: string;
}

// 시음회는 에디터 추천 섹션에서 함께 보여준다.
const TAB_LIST: FeaturedMenuItem[] = [
  { id: 'view-week', name: '주간 TOP 5' },
  { id: 'recent', name: '최근에 본 위스키' },
];

export default function HomeFeaturedSection() {
  return (
    <HomeTabSection
      tabList={TAB_LIST}
      scroll
      renderHeader={(currentTab) => {
        const { label, title } = HOME_FEATURED_CONFIG[currentTab.id];
        return <SectionHeader label={label} title={title} />;
      }}
    >
      {(currentTab) => (
        <HomeFeaturedList key={currentTab.id} type={currentTab.id} />
      )}
    </HomeTabSection>
  );
}
