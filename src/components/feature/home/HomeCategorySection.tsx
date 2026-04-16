'use client';

import CategoryList from '@/components/feature/home/CategoryList';
import HomeTabSection from '@/components/feature/home/HomeTabSection';
import RegionAccordionList from '@/components/feature/home/_components/RegionAccordionList';

const TAB_LIST = [
  { id: 'category', name: '카테고리' },
  { id: 'region', name: '국가별 보기' },
];

export default function HomeCategorySection() {
  return (
    <HomeTabSection
      tabList={TAB_LIST}
      contentClassName="px-[25px] min-h-[80vh]"
    >
      {(currentTab) => {
        switch (currentTab.id) {
          case 'category':
            return <CategoryList />;
          case 'region':
            return <RegionAccordionList />;
          default:
            return null;
        }
      }}
    </HomeTabSection>
  );
}
