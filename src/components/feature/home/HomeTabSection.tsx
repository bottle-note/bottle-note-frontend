'use client';

import Tab from '@/components/ui/Navigation/Tab';
import { useTab } from '@/hooks/useTab';
import { HomeFeaturedConfigKey, MENU_CATEGORY } from '@/constants/home';
import CategoryList from '@/components/feature/home/CategoryList';
import HomeFeaturedList from '@/components/feature/home/HomeFeaturedList';

interface TopMenuItem {
  id: HomeFeaturedConfigKey;
  name: string;
}

const TOP_MENU_ITEMS: TopMenuItem[] = [
  { id: 'view-week', name: '주간 TOP 5' },
  { id: 'recent', name: '최근에 본 위스키' },
];

export default function HomeTabSection() {
  const {
    currentTab: firstMenuSelectedTab,
    handleTab: handelFirstMenu,
    tabList: firstMenuList,
    refs: { scrollContainerRef: firstMenuScrollContainerRef },
    registerTab: firstMenuRegisterTab,
  } = useTab({
    tabList: TOP_MENU_ITEMS,
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
      case 'view-week':
      case 'recent':
        return (
          <HomeFeaturedList
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
    <div className="pt-[22px] space-y-1 relative">
      <section className="pb-20">
        <article className="space-y-[30px]">
          <Tab
            variant="bookmark"
            tabList={firstMenuList}
            handleTab={handelFirstMenu}
            currentTab={firstMenuSelectedTab}
            scrollContainerRef={firstMenuScrollContainerRef}
            registerTab={firstMenuRegisterTab}
          />
          <div className="pb-[59px] pl-[25px]">{renderTopContent()}</div>
        </article>
        <article className="space-y-[30px]">
          <Tab
            variant="bookmark"
            tabList={secondMenuList}
            handleTab={handleSecondMenu}
            currentTab={secondMenuSelectedTab}
            scrollContainerRef={secondMenuScrollContainerRef}
            registerTab={secondMenuRegisterTab}
          />
          {renderCategoryContent()}
        </article>
      </section>
    </div>
  );
}
