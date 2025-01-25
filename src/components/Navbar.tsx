'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthService } from '@/lib/AuthService';

export interface NavItem {
  name: string;
  link: string;
  icon: string;
}

function Navbar({ maxWidth }: { maxWidth: string }) {
  const pathname = usePathname();
  const { userData } = AuthService;

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
      link: '/history',
      icon: '/icon/document-outlined-subcoral.svg',
    },
    {
      name: '마이',
      link: userData ? `/user/${userData.userId}` : '/login',
      icon: '/icon/user-outlined-subcoral.svg',
    },
  ];

  return (
    <nav
      className={`fixed bottom-6 left-0 right-0 mx-auto w-full max-w-[${maxWidth}] px-4 z-10`}
    >
      <section className="h-[4.4rem] flex justify-between bg-[#F6F6F6] py-3 px-5 rounded-[0.8rem] drop-shadow-[0_3px_3px_rgba(0,0,0,0.30)]">
        {navItems.map((menu: NavItem, index: number) => (
          <React.Fragment key={menu.link}>
            <Link
              className={`flex flex-col items-center space-y-1 ${
                (menu.link === '/' && pathname === '/') ||
                (menu.link === '/search' && pathname === '/search') ||
                (menu.link === '/rating' && pathname === '/rating') ||
                (menu.link.startsWith('/user/') &&
                  pathname.startsWith('/user/'))
                  ? ''
                  : 'opacity-40'
              }`}
              href={menu.link}
            >
              <div className="flex flex-col items-center justify-center space-y-[2px]">
                <Image src={menu.icon} alt={menu.name} width={30} height={30} />
                <span className="text-9 text-subCoral">{menu.name}</span>
              </div>
            </Link>
            {index !== navItems.length - 1 && (
              <span className="border-[0.01rem] border-subCoral opacity-40" />
            )}
          </React.Fragment>
        ))}
        {/* 로그인 user가 아니면? 없어지는가? */}
      </section>
    </nav>
  );
}

export default Navbar;
