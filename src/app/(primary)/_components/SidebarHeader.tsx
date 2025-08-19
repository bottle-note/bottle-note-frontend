'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBlockScroll } from '@/hooks/useBlockScroll';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import { UserApi } from '@/app/api/UserApi';
import { AdminApi } from '@/app/api/AdminApi';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { useAuth } from '@/hooks/auth/useAuth';
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

  /*
  - 개발 <-> 상용 변경 핸들러
  - 사이드바에서 특정 유저의 경우 버튼 노출 및 핸들러 적용 (기획 반영 예정)
  - 우선적으로 로고에 적용합니다.
  - 기능 동작을 확인하는 임시 로직이라서 추후 삭제 또는 수정 예정이니 참고부탁드립니다.
  */

  const [count, setCount] = useState(0);
  const { handleModalState, handleCloseModal } = useModalStore();
  const handleSwitchEnv = (env: 'dev' | 'prod') => {
    handleWebViewMessage('switchEnv', env);
    handleCloseModal();
  };

  const handleEnvSwitchModal = async () => {
    try {
      // Check admin permissions first
      const hasPermission = await AdminApi.checkPermissions();
      
      if (hasPermission) {
        // Show environment switch modal if permissions are granted
        handleModalState({
          isShowModal: true,
          type: 'CONFIRM',
          mainText: '개발 환경으로 전환하시겠습니까?',
          confirmBtnName: '개발',
          cancelBtnName: '상용',
          handleConfirm: () => handleSwitchEnv('dev'),
          handleCancel: () => handleSwitchEnv('prod'),
        });
      } else {
        // Show error modal if permissions are denied
        handleModalState({
          isShowModal: true,
          type: 'ALERT',
          mainText: '개발 환경 전환 권한이 없습니다.',
          handleConfirm: handleCloseModal,
        });
      }
    } catch (error) {
      // Show error modal if API call fails
      handleModalState({
        isShowModal: true,
        type: 'ALERT',
        mainText: error instanceof Error ? error.message : '권한 확인 중 오류가 발생했습니다.',
        handleConfirm: handleCloseModal,
      });
    }
  };

  useEffect(() => {
    if (count === 5) {
      handleEnvSwitchModal();
      setCount(0);
    }
  }, [count]);

  if (isOpen) {
    return (
      <article className="flex justify-between bg-subCoral px-[17px] pb-[15px] pt-[74px]">
        <button onClick={() => setCount(count + 1)} className="relative">
          <span className="absolute top-2 left-1 text-xs text-textGray">
            {count ? count : ''}
          </span>
          <Image src={logoSrc} alt="보틀노트" />
        </button>
        <button onClick={handleOpen}>
          <Image src={menuSrc} alt={menuAlt} />
        </button>
      </article>
    );
  }

  return (
    <button onClick={handleOpen}>
      <Image src={menuSrc} alt={menuAlt} />
    </button>
  );
};

const SidebarHeader = () => {
  const route = useRouter();
  const { logout, isLoggedIn } = useAuth();
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
    await logout();
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
          console.error(e);
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
        link: `${process.env.NEXT_PUBLIC_BOTTLE_NOTE_NOTION_URL}board?pvs=4`,
        action: null,
      },
      {
        text: '서비스 문의',
        action: () => route.push('/inquire'),
      },
      {
        text: '이용약관',
        link: `${process.env.NEXT_PUBLIC_BOTTLE_NOTE_NOTION_URL}info?pvs=4`,
        action: null,
      },
      {
        text: '개인정보 처리 방침',
        link: process.env.NEXT_PUBLIC_BOTTLE_NOTE_NOTION_URL,
        action: null,
      },
      ...(isLoggedIn
        ? [
            {
              text: '로그아웃',
              action: handleLogout,
            },
            {
              text: '서비스 탈퇴',
              action: handleDeleteAccount,
            },
          ]
        : []),
    ],
    [isLoggedIn],
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
