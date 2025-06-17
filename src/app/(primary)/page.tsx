'use client';

import { useTab } from '@/hooks/useTab';
import Tab from '@/components/Tab';
import MainCarousel from '@/app/(primary)/_components/MainCarousel';
import { BANNER_IMAGES, TOP_MENU_ITEMS, MENU_CATEGORY } from '@/constants/home';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import CategoryList from './_components/CategoryList';
import PopularList from './_components/PopularList';
import NavLayout from './_components/NavLayout';

export default function Home() {
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
      case 'week':
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
      <SubHeader>
        <SubHeader.Left useHomeLogo />
        <SubHeader.Right useSideMenu />
      </SubHeader>
      <MainCarousel images={BANNER_IMAGES} />
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
    </NavLayout>
  );
}
