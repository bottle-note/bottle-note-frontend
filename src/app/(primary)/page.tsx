'use client';

import { Suspense, useState } from 'react';
import Header from '@/app/(primary)/_components/Header';
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
];
export default function Home() {
  const [activeMenu, setActiveMenu] = useState(TOP_MENU_ITEMS[0].id);

  const renderContent = () => {
    switch (activeMenu) {
      case 'popular':
        return <PopularList />;
      case 'new':
        return <div>새로 나온 위스키 목록</div>;
      case 'recommend':
        return <div>추천 위스키 목록</div>;
      default:
        return null;
    }
  };

  return (
    <Suspense>
      <NavLayout>
        <Header />
        <div className="space-y-1 relative">
          <section className="px-5 pb-20">
            <article className="pt-10 space-y-[18px]">
              <TabNavigation
                items={TOP_MENU_ITEMS}
                activeId={activeMenu}
                onSelect={setActiveMenu}
              >
                {renderContent()}
              </TabNavigation>
            </article>
            <article className="pt-10 space-y-[18px]">
              <TabNavigation items={MENU_CATEGORY}>
                <CategoryList />
              </TabNavigation>
            </article>
          </section>
        </div>
      </NavLayout>
    </Suspense>
  );
}
