'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { useBlockScroll } from '@/hooks/useBlockScroll';
import { AuthService } from '@/lib/AuthService';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import { UserApi } from '@/app/api/UserApi';
import Logo from 'public/bottle_note_Icon_logo.svg';
import LogoWhite from 'public/bottle_note_Icon_logo_white.svg';
import Menu from 'public/icon/menu-subcoral.svg';
import MenuWhite from 'public/icon/menu-white.svg';
import SidebarDeco from 'public/sidebar-deco.png';

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
    <article className={`flex justify-between ${bgColor} ${padding} pt-16`}>
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
  const route = useRouter();
  const { logout } = AuthService;
  const { data: session } = useSession();
  const { handleScroll } = useBlockScroll();
  const { handleModalState, handleCloseModal } = useModalStore();
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

  const handleLogout = async () => {
    logout();
    if (session) await signOut({ callbackUrl: '/', redirect: true });
    handleCloseModal();
    route.push('/');
  };

  const handleDeleteAccount = async () => {
    handleModalState({
      isShowModal: true,
      cancelBtnName: '예',
      confirmBtnName: '아니오',
      type: 'CONFIRM',
      mainText: `서비스를 탈퇴하시겠습니까?`,
      handleCancel: async () => {
        try {
          await UserApi.deleteAccount();
          handleModalState({
            type: 'ALERT',
            mainText: `탈퇴가 완료되었습니다.`,
            handleConfirm: handleLogout,
          });
        } catch (e) {
          console.log(e);
          handleCloseModal();
        }
      },
      handleConfirm: handleCloseModal,
    });
  };

  const SIDEBAR_MENUS = useMemo(
    () => [
      {
        text: '공지사항',
        action: () => route.push('/announcement'),
      },
      {
        text: '서비스 문의',
        action: () => route.push('/inquire'),
      },
      {
        text: '이용약관',
        link: 'https://bottle-note.notion.site/info?pvs=4',
        action: null,
      },
      {
        text: '개인정보 처리 방침',
        link: 'http://bottle-note.notion.site/',
        action: null,
      },
      {
        text: '로그아웃',
        action: handleLogout,
      },
      {
        text: '서비스 탈퇴',
        action: handleDeleteAccount,
      },
    ],
    [],
  );

  useEffect(() => {
    handleScroll({ isScroll: !isOpen });
  }, [isOpen]);

  return (
    <>
      <Header isOpen={false} handleOpen={handleOpen} />

      {isOpen && (
        <motion.aside
          className="z-20 bg-[#F0996E] bg-opacity-85 fixed inset-0 backdrop-blur-sm"
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
                  className="py-3.5 text-white text-sm flex "
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  {menu.action && (
                    <button
                      onClick={menu.action}
                      className="w-full flex justify-between"
                    >
                      <span>{menu.text}</span>
                      <span>{'>'}</span>
                    </button>
                  )}

                  {menu.link && (
                    <Link
                      href={menu.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex justify-between"
                    >
                      <span>{menu.text}</span>
                      <span>{'>'}</span>
                    </Link>
                  )}
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
      <Modal />
    </>
  );
};

export default SidebarHeader;
