'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import useModalStore from '@/store/modalStore';
import { ROUTES } from '@/constants/routes';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { cn } from '@/lib/utils';

export interface NavItem {
  name: string;
  link: string;
  icon: string;
  requiresAuth?: boolean;
}

interface NavbarProps {
  maxWidth?: string;
  isSuppressed?: boolean;
  isScrollVisible?: boolean;
}

function Navbar({
  maxWidth,
  isSuppressed = false,
  isScrollVisible = true,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: userData, isLoggedIn } = useAuth();
  const { handleLoginModal } = useModalStore();
  const [isMounted, setIsMounted] = useState(false);
  const [lastTapTime, setLastTapTime] = useState<{ [key: string]: number }>({});
  const shouldShowNavbar = isScrollVisible && !isSuppressed;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const navItems: NavItem[] = [
    { name: '홈', link: ROUTES.HOME, icon: '/icon/navbar/home.svg' },
    {
      name: '리뷰',
      link: ROUTES.REVIEW.REGISTER_BASE,
      icon: '/icon/navbar/review.svg',
    },
    // {
    //   name: '검색',
    //   link: ROUTES.SEARCH.BASE,
    //   icon: '/icon/navbar/search.svg',
    // },
    {
      name: '시음회',
      link: ROUTES.CURATION.BASE,
      icon: '/icon/navbar/curation.svg',
    },
    {
      name: '둘러보기',
      link: ROUTES.EXPLORE.BASE,
      icon: '/icon/navbar/explorer.svg',
    },
    {
      name: '마이',
      link: userData?.userId ? ROUTES.USER.BASE(userData.userId) : ROUTES.LOGIN,
      icon: '/icon/navbar/user.svg',
      requiresAuth: true,
    },
  ];

  const handleNavigation = async (menu: NavItem) => {
    const currentTime = Date.now();
    const lastTap = lastTapTime[menu.link] || 0;
    const timeDiff = currentTime - lastTap;

    if (isActive(menu.link) && timeDiff < 1000) {
      scrollToTop();
      return;
    }

    if (isActive(menu.link)) {
      setLastTapTime((prev) => ({
        ...prev,
        [menu.link]: currentTime,
      }));

      return;
    }

    setLastTapTime((prev) => ({
      ...prev,
      [menu.link]: currentTime,
    }));

    if (menu.requiresAuth && !isLoggedIn) {
      return handleLoginModal();
    }

    router.push(menu.link);
  };

  const isActive = (link: string) => {
    if (link === '') {
      return false;
    }

    if (link === '/') {
      return pathname === '/';
    }

    return pathname === link || pathname.startsWith(link);
  };

  return (
    <nav
      aria-hidden={!shouldShowNavbar}
      className={cn(
        `fixed left-0 right-0 mx-auto w-full px-4 z-10 transition-transform duration-300 ease-in-out`,
        shouldShowNavbar
          ? 'translate-y-0'
          : 'pointer-events-none translate-y-[calc(100%+var(--navbar-margin-bottom))]',
        maxWidth ? `max-w-[${maxWidth}]` : 'max-w-content',
      )}
      style={{ bottom: 'var(--navbar-margin-bottom)' }}
    >
      <section className="h-[70px] flex justify-between bg-white dark:bg-bn-raised py-4 px-[26px] rounded-[13px] drop-shadow-[0_3px_3px_rgba(0,0,0,0.30)]">
        {navItems.map((menu, index) => (
          <React.Fragment key={menu.link}>
            <button
              className={`flex flex-col items-center space-y-1 ${isMounted && !isActive(menu.link) ? 'opacity-40' : ''}`}
              tabIndex={shouldShowNavbar ? undefined : -1}
              onClick={() => handleNavigation(menu)}
              onTouchEnd={() =>
                handleWebViewMessage('triggerHaptic', { type: 'light' })
              }
            >
              <div className="flex flex-col items-center justify-center space-y-[2px]">
                <Image
                  src={menu.icon}
                  alt={menu.name}
                  width={26}
                  height={26}
                  style={{ width: 26, height: 26 }}
                />
                <span className="text-10 font-medium text-subCoral dark:text-bn-brand">
                  {menu.name}
                </span>
              </div>
            </button>
            {index !== navItems.length - 1 && (
              <span className="border-[0.01rem] border-subCoral dark:border-bn-border opacity-40 dark:opacity-100" />
            )}
          </React.Fragment>
        ))}
      </section>
    </nav>
  );
}

export default Navbar;
