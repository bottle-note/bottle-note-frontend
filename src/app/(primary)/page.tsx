'use client';

import { useState } from 'react';

import { useTab } from '@/hooks/useTab';
import Tab from '@/components/ui/Navigation/Tab';
import HomeCarousel from '@/components/feature/home/HomeCarousel';
import { HomeFeaturedConfigKey, MENU_CATEGORY } from '@/constants/home';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import CategoryList from '@/components/feature/home/CategoryList';
import DynamicAlcoholList from '@/components/feature/home/DynamicAlcoholList';
import NavLayout from '@/components/ui/Layout/NavLayout';
import JsonLd from '@/components/seo/JsonLd';
import { generateWebSiteSchema } from '@/utils/seo/generateWebSiteSchema';
import { TarotPromoCard } from '@/components/feature/home/TarotPromoCard';

interface TopMenuItem {
  id: HomeFeaturedConfigKey;
  name: string;
}

export const TOP_MENU_ITEMS: TopMenuItem[] = [
  { id: 'view-week', name: '주간 TOP 5' },
  { id: 'recent', name: '최근에 본 위스키' },
];

export default function Home() {
  const [showTarotPromo, setShowTarotPromo] = useState(true);

  const handleCloseTarotPromo = () => {
    setShowTarotPromo(false);
  };

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

        {/* TODO: 프로모에 대해 별도 컴포넌트로 처리 (여러개 추가될 경우.) */}
        {showTarotPromo && <TarotPromoCard onClose={handleCloseTarotPromo} />}

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
