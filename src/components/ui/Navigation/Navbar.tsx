'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import useModalStore from '@/store/modalStore';
import { ROUTES } from '@/constants/routes';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { useScrollState } from '@/hooks/useScrollState';
import { cn } from '@/lib/utils';

export interface NavItem {
  name: string;
  link: string;
  icon: string;
  requiresAuth?: boolean;
}

function Navbar({ maxWidth }: { maxWidth?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: userData, isLoggedIn } = useAuth();
  const { handleLoginModal } = useModalStore();
  const [isMounted, setIsMounted] = useState(false);
  const [lastTapTime, setLastTapTime] = useState<{ [key: string]: number }>({});
  const { isVisible } = useScrollState(100);

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
      requiresAuth: true,
    },
    {
      name: '큐레이션',
      link: ROUTES.CURATION.BASE,
      icon: '/icon/navbar/star.svg',
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

      if (menu.link === ROUTES.SEARCH.BASE) {
        router.push(ROUTES.SEARCH.BASE);
      }
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
      className={cn(
        `fixed left-0 right-0 mx-auto w-full px-[11px] z-10 transition-transform duration-300 ease-in-out`,
        isVisible ? 'translate-y-0' : 'translate-y-[calc(100%+24px)]',
        maxWidth ? `max-w-[${maxWidth}]` : 'max-w-content',
      )}
      style={{ bottom: 'var(--navbar-margin-bottom)' }}
    >
      <section className="flex items-center justify-center gap-[18px] rounded-xl bg-sectionWhite px-[26px] py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.20)]">
        {navItems.map((menu, index) => (
          <React.Fragment key={menu.link}>
            <button
              className={cn(
                'flex w-[30px] flex-col items-center',
                isMounted && !isActive(menu.link) ? 'opacity-40' : '',
              )}
              onClick={() => handleNavigation(menu)}
              onTouchEnd={() =>
                handleWebViewMessage('triggerHaptic', { type: 'light' })
              }
            >
              <div className="flex flex-col items-center justify-center gap-0.5">
                <Image
                  src={menu.icon}
                  alt={menu.name}
                  width={26}
                  height={26}
                  style={{ width: 26, height: 26 }}
                />
                <span className="whitespace-nowrap text-10 font-medium text-subCoral">
                  {menu.name}
                </span>
              </div>
            </button>
            {index !== navItems.length - 1 && (
              <span className="h-[42px] border-l border-subCoral opacity-20" />
            )}
          </React.Fragment>
        ))}
      </section>
    </nav>
  );
}

export default Navbar;
