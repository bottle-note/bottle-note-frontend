'use client';

import { useState } from 'react';
import Image from 'next/image';
import Logo from 'public/Logo_2.svg';
import Menu from 'public/Menu_Sub_Coral.svg';
import SidebarDeco from 'public/sidebar-deco.png';
import { SIDEBAR_MENUS } from '../_constants';

// TODO: block scroll when sidebar is open
const SidebarHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <article className="flex justify-between pb-6">
        <button>
          <Image src={Logo} alt="보틀노트" />
        </button>

        <button onClick={() => setIsOpen(true)}>
          <Image src={Menu} alt="메뉴 열기" />
        </button>
      </article>

      {/* TODO: 고민이 되는 지점은, 상단 헤더 메뉴를 중복해서 노출시킬 것인지 아니면 색상만 변경시킬 것인지.. */}
      {isOpen && (
        <aside className="z-10 flex flex-col gap-14 bg-[#F0996E] bg-opacity-85 fixed inset-0 p-7.5 backdrop-blur-sm">
          <article className="flex">
            <Image src={SidebarDeco} alt="Sidebar" />
          </article>

          <ul className="divide-y divide-white border-y border-white ">
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
          <button onClick={() => setIsOpen(false)}>닫아라옹 X</button>
        </aside>
      )}
    </>
  );
};

export default SidebarHeader;
