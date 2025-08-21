'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import useModalStore from '@/store/modalStore';
import { AdminApi } from '@/app/api/AdminApi';
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
        mainText:
          error instanceof Error
            ? error.message
            : '권한 확인 중 오류가 발생했습니다.',
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
