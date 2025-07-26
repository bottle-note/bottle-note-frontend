'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import useModalStore from '@/store/modalStore';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import Logo from 'public/bottle_note_Icon_logo.svg';
import LogoWhite from 'public/bottle_note_Icon_logo_white.svg';
import Menu from 'public/icon/menu-subcoral.svg';
import MenuWhite from 'public/icon/menu-white.svg';

interface SettingsHeaderProps {
  handleOpen: () => void;
  isOpen: boolean;
}

export const SettingsHeader = ({ handleOpen, isOpen }: SettingsHeaderProps) => {
  const logoSrc = isOpen ? LogoWhite : Logo;
  const menuSrc = isOpen ? MenuWhite : Menu;
  const menuAlt = isOpen ? '메뉴 닫기' : '메뉴 열기';

  const [count, setCount] = useState(0);
  const { handleModalState, handleCloseModal } = useModalStore();

  const handleSwitchEnv = (env: 'dev' | 'prod') => {
    handleWebViewMessage('switchEnv', env);
    handleCloseModal();
  };

  useEffect(() => {
    if (count === 5) {
      handleModalState({
        isShowModal: true,
        type: 'CONFIRM',
        mainText: '개발 환경으로 전환하시겠습니까?',
        confirmBtnName: '개발',
        cancelBtnName: '상용',
        handleConfirm: () => handleSwitchEnv('dev'),
        handleCancel: () => handleSwitchEnv('prod'),
      });
      setCount(0);
    }
  }, [count, handleModalState, handleCloseModal]);

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
