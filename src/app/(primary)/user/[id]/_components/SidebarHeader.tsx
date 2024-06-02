'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Logo from 'public/logo-text-subcoral.svg';
import LogoWhite from 'public/logo-text-white.svg';
import Menu from 'public/menu-subcoral.svg';
import MenuWhite from 'public/menu-white.svg';
import SidebarDeco from 'public/sidebar-deco.png';
import { SIDEBAR_MENUS } from '../_constants';

// TODO: block scroll when sidebar is open

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

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    closed: { x: '100%', opacity: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 100,
      },
    }),
  };

  return (
    <>
      <Header isOpen={false} handleOpen={handleOpen} />

      {isOpen && (
        <motion.aside
          className="z-10 bg-[#F0996E] bg-opacity-85 fixed inset-0 backdrop-blur-sm"
          initial="closed"
          animate="open"
          exit="closed"
          variants={sidebarVariants}
        >
          <Header isOpen={isOpen} handleOpen={handleOpen} />

          <section className="flex flex-col gap-14 p-7.5 pt-14">
            <article className="flex">
              <Image src={SidebarDeco} alt="Sidebar" />
            </article>

            <ul className="divide-y divide-white border-y border-white">
              {SIDEBAR_MENUS.map((menu, index) => (
                <motion.li
                  key={menu.text}
                  className="py-3.5 text-white text-sm flex justify-between"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  <span>{menu.text}</span>
                  {/* FIXME: 아이콘으로 변경 */}
                  <button> {'>'} </button>
                </motion.li>
              ))}
            </ul>

            <article className="border-t border-white pt-2.5">
              <p className="text-xxs text-center text-white">
                © Copyright 2024. Bottle Note. All rights reserved.
              </p>
            </article>
          </section>
        </motion.aside>
      )}
    </>
  );
};

export default SidebarHeader;
