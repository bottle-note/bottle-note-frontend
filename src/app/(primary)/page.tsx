'use client';

import Header from '@/app/(primary)/_components/Header';
import { useTab } from '@/hooks/useTab';
import CategoryList from './_components/CategoryList';
import PopularList from './_components/PopularList';
import NavLayout from './_components/NavLayout';
import TabNavigation from './_components/TabNavigation';

const TOP_MENU_ITEMS = [
  { id: 'popular', name: '위클리 HOT 5' },
  { id: 'recommend', name: 'Spring 위스키 추천' },
];

const MENU_CATEGORY = [
  { id: 'category', name: '카테고리' },
  { id: 'recent', name: '최근에 본 위스키' },
  { id: 'recent1', name: '최근에 리쥬 쓴 위스키' },
  { id: 'recent2', name: '최근에 찜한 위스키' },
];

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
      case 'recent':
        return <div>최근에 본 위스키</div>;
      case 'recent1':
        return <div>최근에 본 위스키</div>;
      case 'recent2':
        return <div>최근에 본 위스키</div>;
      default:
        return null;
    }
  };

  return (
    <NavLayout>
      <Header />
      <div className="space-y-1 relative">
        <section className="px-5 pb-20">
          <article className="pt-10 space-y-[18px]">
            <TabNavigation
              items={topMenuItems}
              activeId={activeTopMenu}
              onSelect={setActiveTopMenu}
            >
              {renderTopContent()}
            </TabNavigation>
          </article>
          <article className="pt-10 space-y-[18px]">
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
