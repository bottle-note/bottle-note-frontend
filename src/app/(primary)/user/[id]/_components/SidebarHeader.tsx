'use client';

import { useState } from 'react';
import Image from 'next/image';
import Logo from 'public/Logo_2.svg';
import LogoWhite from 'public/Logo_2_white.svg';
import Menu from 'public/Menu_Sub_Coral.svg';
import MenuWhite from 'public/Menu_white.svg';
import SidebarDeco from 'public/sidebar-deco.png';
import { SIDEBAR_MENUS } from '../_constants';

// TODO: block scroll when sidebar is open
// TODO: add animation

const Header = ({
  handleOpen,
  isOpen,
}: {
  handleOpen: () => void;
  isOpen: boolean;
}) => {
  const logoSrc = isOpen ? LogoWhite : Logo;
  const menuSrc = isOpen ? MenuWhite : Menu;
  const menuAlt = isOpen ? '메뉴 닫기' : '메뉴 열기';
  const bgColor = isOpen ? 'bg-subCoral' : '';
  const padding = isOpen ? 'p-7.5' : 'pb-6';

  return (
    <article className={`flex justify-between ${bgColor} ${padding}`}>
      <button>
        <Image src={logoSrc} alt="보틀노트" />
      </button>
      <button onClick={handleOpen}>
        <Image src={menuSrc} alt={menuAlt} />
      </button>
    </article>
  );
};

const SidebarHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Header isOpen={isOpen} handleOpen={handleOpen} />

      {isOpen && (
        <aside className="z-10 bg-[#F0996E] bg-opacity-85 fixed inset-0 backdrop-blur-sm">
          <Header isOpen={isOpen} handleOpen={handleOpen} />

          <section className="flex flex-col gap-14 p-7.5 pt-14">
            <article className="flex">
              <Image src={SidebarDeco} alt="Sidebar" />
            </article>

            <ul className="divide-y divide-white border-y border-white">
              {SIDEBAR_MENUS.map((menu) => {
                return (
                  <li
                    key={menu.text}
                    className="py-3.5 text-white text-sm flex justify-between"
                  >
                    <span>{menu.text}</span>
                    {/* FIXME: 아이콘으로 변경 */}
                    <button> {'>'} </button>
                  </li>
                );
              })}
            </ul>

            <article className="border-t border-white pt-2.5">
              <p className="text-xxs text-center text-white">
                © Copyright 2024. Bottle Note. All rights reserved.
              </p>
            </article>
          </section>
        </aside>
      )}
    </>
  );
};

export default SidebarHeader;
