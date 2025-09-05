'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import useModalStore from '@/store/modalStore';
import { ROUTES } from '@/constants/routes';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { throttle } from '@/utils/throttle';

export interface NavItem {
  name: string;
  link: string;
  icon: string;
  requiresAuth?: boolean;
}

function Navbar({ maxWidth }: { maxWidth: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: userData, isLoggedIn } = useAuth();
  const { handleLoginModal } = useModalStore();
  const [isMounted, setIsMounted] = useState(false);
  const [lastTapTime, setLastTapTime] = useState<{ [key: string]: number }>({});
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 10;

      if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
        return;
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    }, 16);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const navItems: NavItem[] = [
    { name: '홈', link: ROUTES.HOME, icon: '/icon/navbar/home.svg' },
    { name: '검색', link: ROUTES.SEARCH.BASE, icon: '/icon/navbar/search.svg' },
    {
      name: '둘러보기',
      link: ROUTES.EXPLORE.BASE,
      icon: '/icon/navbar/explorer.svg',
    },
    {
      name: '기록',
      link: ROUTES.HISTORY.BASE,
      icon: '/icon/navbar/history.svg',
      requiresAuth: true,
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
      if (menu.link === ROUTES.HISTORY.BASE) {
        return handleLoginModal();
      }
      return router.push(ROUTES.LOGIN);
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
      className={`fixed bottom-6 left-0 right-0 mx-auto w-full max-w-[${maxWidth}] px-4 z-10 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-[calc(100%+24px)]'
      }`}
    >
      <section className="h-[4.4rem] flex justify-between bg-[#F6F6F6] py-4 px-[26px] rounded-[0.8rem] drop-shadow-[0_3px_3px_rgba(0,0,0,0.30)]">
        {navItems.map((menu, index) => (
          <React.Fragment key={menu.link}>
            <button
              className={`flex flex-col items-center space-y-1 ${isMounted && !isActive(menu.link) ? 'opacity-40' : ''}`}
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
                <span className="text-10 font-medium text-subCoral">
                  {menu.name}
                </span>
              </div>
            </button>
            {index !== navItems.length - 1 && (
              <span className="border-[0.01rem] border-subCoral opacity-40" />
            )}
          </React.Fragment>
        ))}
      </section>
    </nav>
  );
}

export default Navbar;
