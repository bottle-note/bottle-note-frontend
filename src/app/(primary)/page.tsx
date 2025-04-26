'use client';

import Header from '@/app/(primary)/_components/Header';
import { useTab } from '@/hooks/useTab';
import CategoryList from './_components/CategoryList';
import PopularList from './_components/PopularList';
import NavLayout from './_components/NavLayout';
import TabNavigation from './_components/TabNavigation';

const TOP_MENU_ITEMS = [
  { id: 'popular', name: 'HOT 5' },
  { id: 'spring_recommend', name: '봄 추천 위스키' },
  { id: 'recent', name: '최근에 본 위스키' },
];

const MENU_CATEGORY = [{ id: 'category', name: '카테고리' }];

export default function Home() {
  const {
    activeTab: activeTopMenu,
    setActiveTab: setActiveTopMenu,
    items: topMenuItems,
  } = useTab({
    items: TOP_MENU_ITEMS,
  });

  const {
    activeTab: activeCategoryMenu,
    setActiveTab: setActiveCategoryMenu,
    items: categoryItems,
  } = useTab({
    items: MENU_CATEGORY,
  });

  const renderTopContent = () => {
    switch (activeTopMenu) {
      case 'popular':
        return <PopularList />;
      case 'recommend':
        return <div>추천 위스키 목록</div>;
      default:
        return null;
    }
  };

  const renderCategoryContent = () => {
    switch (activeCategoryMenu) {
      case 'category':
        return <CategoryList />;
      default:
        return null;
    }
  };

  return (
    <NavLayout>
      <Header />
      <div className="space-y-1 relative">
        <section className="pb-20">
          <article className="pt-10 space-y-[18px]">
            <TabNavigation
              items={topMenuItems}
              activeId={activeTopMenu}
              onSelect={setActiveTopMenu}
            >
              {renderTopContent()}
            </TabNavigation>
          </article>
          <article className="pt-[60px] space-y-[18px]">
            <TabNavigation
              items={categoryItems}
              activeId={activeCategoryMenu}
              onSelect={setActiveCategoryMenu}
            >
              {renderCategoryContent()}
            </TabNavigation>
          </article>
        </section>
      </div>
    </NavLayout>
  );
}
