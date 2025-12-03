'use client';

import { useTab } from '@/hooks/useTab';
import Tab from '@/components/ui/Navigation/Tab';
import HomeCarousel from '@/components/feature/home/HomeCarousel';
import { TOP_MENU_ITEMS, MENU_CATEGORY } from '@/constants/home';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import CategoryList from '@/components/feature/home/CategoryList';
import DynamicAlcoholList from '@/components/feature/home/DynamicAlcoholList';
import NavLayout from '@/components/ui/Layout/NavLayout';
import JsonLd from '@/components/seo/JsonLd';
import { generateWebSiteSchema } from '@/utils/seo/generateWebSiteSchema';

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
          <DynamicAlcoholList
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

  const webSiteSchemas = generateWebSiteSchema();

  return (
    <>
      {webSiteSchemas.map((schema) => (
        <JsonLd key={schema['@type']} data={schema} />
      ))}
      <NavLayout>
        <SubHeader>
          <SubHeader.Left>
            <SubHeader.Logo />
          </SubHeader.Left>
          <SubHeader.Right>
            <SubHeader.Menu />
          </SubHeader.Right>
        </SubHeader>
        <HomeCarousel />
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
    </>
  );
}
