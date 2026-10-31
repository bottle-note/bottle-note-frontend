'use client';

import CategoryList from '@/components/feature/home/CategoryList';
import SectionHeader from '@/components/ui/Display/SectionHeader';
import HomeTabSection from '@/components/feature/home/HomeTabSection';
import RegionAccordionList from '@/components/feature/home/_components/RegionAccordionList';

const TAB_LIST = [
  { id: 'category', name: '카테고리' },
  { id: 'region', name: '국가별 보기' },
];

/** 둘러보기 진입: 카테고리·국가별로 위스키 둘러보기 탭에 필터를 걸어 연결한다. */
export default function HomeExploreSection() {
  return (
    <section aria-label="위스키 둘러보기" className="space-y-20">
      <SectionHeader
        label="EXPLORE"
        title="싱글 몰트부터 버번까지 골라보세요"
      />
      <HomeTabSection tabList={TAB_LIST} contentClassName="px-20">
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
    </section>
  );
}
