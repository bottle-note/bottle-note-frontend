'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTab } from '@/hooks/useTab';
import Tab from '@/components/Tab';
import MainCarousel from '@/app/(primary)/_components/MainCarousel';
import { ROUTES } from '@/constants/routes';
import { BANNER_IMAGES, TOP_MENU_ITEMS, MENU_CATEGORY } from '@/constants/home';
import CategoryList from './_components/CategoryList';
import PopularList from './_components/PopularList';
import NavLayout from './_components/NavLayout';
import mainLogo from 'public/bottle_note_logo_main.svg';
import EnterIcon from 'public/icon/search-subcoral.svg';

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
      <header className="bg-white  py-[15px] px-[17px] pt-14 flex items-center justify-between">
        <Image src={mainLogo} alt="Logo" priority />
        <Link href={ROUTES.SEARCH.BASE} className="relative">
          <Image src={EnterIcon} alt="search button" />
        </Link>
      </header>
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
