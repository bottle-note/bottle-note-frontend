'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { AuthService } from '@/lib/AuthService';
import { checkTokenValidity } from '@/utils/checkTokenValidity';

export interface NavItem {
  name: string;
  link: string;
  icon: string;
  requiresAuth?: boolean;
}

function Navbar({ maxWidth }: { maxWidth: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { userData, logout } = AuthService;

  const navItems: NavItem[] = [
    { name: '홈', link: '/', icon: '/icon/home-outlined-subcoral.svg' },
    { name: '검색', link: '/search', icon: '/icon/search-subcoral.svg' },
    { name: '별점', link: '/rating', icon: '/icon/star-filled-subcoral.svg' },
    {
      name: '기록',
      link: '/history',
      icon: '/icon/document-outlined-subcoral.svg',
      requiresAuth: true,
    },
    {
      name: '마이',
      link: `/user/${userData?.userId || ''}`,
      icon: '/icon/user-outlined-subcoral.svg',
      requiresAuth: true,
    },
  ];

  const handleNavigation = async (menu: NavItem) => {
    if (menu.requiresAuth) {
      if (!userData || !(await checkTokenValidity())) {
        logout();
        return router.push('/login');
      }
    }
    router.push(menu.link);
  };

  const isActive = (link: string) =>
    pathname === link || pathname.startsWith(link);

  return (
    <nav
      className={`fixed bottom-6 left-0 right-0 mx-auto w-full max-w-[${maxWidth}] px-4 z-10`}
    >
      <section className="h-[4.4rem] flex justify-between bg-[#F6F6F6] py-3 px-5 rounded-[0.8rem] drop-shadow-[0_3px_3px_rgba(0,0,0,0.30)]">
        {navItems.map((menu, index) => (
          <React.Fragment key={menu.link}>
            <button
              className={`flex flex-col items-center space-y-1 ${isActive(menu.link) ? '' : 'opacity-40'}`}
              onClick={() => handleNavigation(menu)}
            >
              <div className="flex flex-col items-center justify-center space-y-[2px]">
                <Image src={menu.icon} alt={menu.name} width={30} height={30} />
                <span className="text-9 text-subCoral">{menu.name}</span>
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
