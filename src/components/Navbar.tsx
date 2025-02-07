'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthService } from '@/lib/AuthService';
import { checkTokenValidity } from '@/utils/checkTokenValidity';

export interface NavItem {
  name: string;
  link: string;
  icon: string;
}

function Navbar({ maxWidth }: { maxWidth: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLogin, userData, logout } = AuthService;

  const navItems: NavItem[] = [
    { name: '홈', link: '/', icon: '/icon/home-outlined-subcoral.svg' },
    { name: '검색', link: '/search', icon: '/icon/search-subcoral.svg' },
    {
      name: '별점',
      link: '/rating',
      icon: '/icon/star-filled-subcoral.svg',
    },
    {
      name: '기록',
      link: isLogin ? '/history' : '/login',
      icon: '/icon/document-outlined-subcoral.svg',
    },
    {
      name: '마이',
      link: isLogin && userData ? `/user/${userData.userId}` : '/login',
      icon: '/icon/user-outlined-subcoral.svg',
    },
  ];

  const handleCheckIsLogin = async () => {
    if (!userData) {
      logout();
      return router.push('/login');
    }

    if (userData) {
      const verifyResult = await checkTokenValidity();
      if (!verifyResult) {
        logout();
        return router.push('/login');
      }
    }

    return router.push(`/user/${userData.userId}`);
  };

  const isActive = (link: string, pathName: string) => {
    if (
      link === '/' ||
      link === '/search' ||
      link === '/rating' ||
      link === '/history'
    ) {
      return link === pathName;
    }
    return pathName.startsWith(link);
  };

  return (
    <nav
      className={`fixed bottom-6 left-0 right-0 mx-auto w-full max-w-[${maxWidth}] px-4 z-10`}
    >
      <section className="h-[4.4rem] flex justify-between bg-[#F6F6F6] py-3 px-5 rounded-[0.8rem] drop-shadow-[0_3px_3px_rgba(0,0,0,0.30)]">
        {navItems.map((menu: NavItem, index: number) => (
          <React.Fragment key={menu.link}>
            <button
              className={`flex flex-col items-center space-y-1 ${isActive(menu.link, pathname) ? '' : 'opacity-40'}`}
              onClick={
                menu.name === '마이'
                  ? handleCheckIsLogin
                  : () => router.push(menu.link)
              }
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
