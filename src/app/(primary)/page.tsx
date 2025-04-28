'use client';

import Header from '@/app/(primary)/_components/Header';
import { useTab } from '@/hooks/useTab';
import TabNavigation from '@/components/Tab/TabNavigation';
import TabContent from '@/components/Tab/TabContent';
import CategoryList from './_components/CategoryList';
import PopularList from './_components/PopularList';
import NavLayout from './_components/NavLayout';

const TOP_MENU_ITEMS = [
  { id: 'week', name: 'HOT 5' },
  { id: 'spring', name: '봄 추천 위스키' },
  { id: 'recent', name: '최근에 본 위스키' },
];

const MENU_CATEGORY = [{ id: 'category', name: '카테고리' }];

export default function Home() {
  const {
    currentTab: firstMenuSelectedTab,
    handleTab: handelFirstMenu,
    tabList: firstMenuList,
    refs: { scrollContainerRef: firstMenuScrollContainerRef },
    registerTab: firstMenuRegisterTab,
  } = useTab({
    tabList: TOP_MENU_ITEMS,
    offset: 16,
    scroll: true,
  });

  const {
    currentTab: secondMenuSelectedTab,
    handleTab: handleSecondMenu,
    tabList: secondMenuList,
    refs: { scrollContainerRef: secondMenuScrollContainerRef },
    registerTab: secondMenuRegisterTab,
  } = useTab({
    tabList: MENU_CATEGORY,
  });

  const renderTopContent = () => {
    switch (firstMenuSelectedTab.id) {
      case 'week':
      case 'spring':
      case 'recent':
        return (
          <PopularList
            key={firstMenuSelectedTab.id}
            type={firstMenuSelectedTab.id}
          />
        );
      default:
        return null;
    }
  };

  const renderCategoryContent = () => {
    switch (secondMenuSelectedTab.id) {
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
              tabList={firstMenuList}
              handleTab={handelFirstMenu}
              currentTab={firstMenuSelectedTab}
              scrollContainerRef={firstMenuScrollContainerRef}
              registerTab={firstMenuRegisterTab}
            />
            <TabContent>{renderTopContent()}</TabContent>
          </article>
          <article className="pt-[60px] space-y-[18px]">
            <TabNavigation
              tabList={secondMenuList}
              handleTab={handleSecondMenu}
              currentTab={secondMenuSelectedTab}
              scrollContainerRef={secondMenuScrollContainerRef}
              registerTab={secondMenuRegisterTab}
            />
            <TabContent>{renderCategoryContent()}</TabContent>
          </article>
        </section>
      </div>
    </NavLayout>
  );
}
