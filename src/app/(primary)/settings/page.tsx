'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { AuthService } from '@/lib/AuthService';
import useModalStore from '@/store/modalStore';
import { useSettingsStore } from '@/store/settingsStore';
import { UserApi } from '@/app/api/UserApi';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import Modal from '@/components/Modal';
import { ScreenType, ScreenConfig, MenuCategory } from '@/types/Settings';
import { SettingsMainScreen } from './_components/SettingsMainScreen';
import { SettingsSubScreen } from './_components/SettingsSubScreen';
import { createScreenConfigs, createMenuCategories } from './config';

export default function Settings() {
  const route = useRouter();
  const { logout } = AuthService;
  const { data: session } = useSession();
  const { handleModalState, handleCloseModal } = useModalStore();
  const { currentScreen, setCurrentScreen, resetToMain, clearStorage } =
    useSettingsStore();

  const navigateToScreen = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  const navigateBack = () => {
    resetToMain();
  };

  const signOutAndRedirect = async () => {
    logout();
    clearStorage();
    handleCloseModal();
    if (session) {
      await signOut({ callbackUrl: '/', redirect: true });
    } else {
      route.push('/');
    }
  };

  const handleLogout = async () => {
    handleModalState({
      isShowModal: true,
      cancelBtnName: '아니오',
      confirmBtnName: '예',
      type: 'CONFIRM',
      mainText: `정말 로그아웃하시겠습니까?`,
      handleConfirm: async () => {
        try {
          await signOutAndRedirect();
        } catch (e) {
          console.error('로그아웃 중 오류:', e);
          handleModalState({
            type: 'ALERT',
            mainText: '로그아웃 중 오류가 발생했습니다.',
            handleConfirm: handleCloseModal,
          });
        }
      },
      handleCancel: handleCloseModal,
    });
  };

  const handleDeleteAccount = async () => {
    handleModalState({
      isShowModal: true,
      cancelBtnName: '아니오',
      confirmBtnName: '예',
      type: 'CONFIRM',
      mainText: `서비스를 탈퇴하시겠습니까?`,
      handleConfirm: async () => {
        try {
          await UserApi.deleteAccount();
          handleModalState({
            type: 'ALERT',
            mainText: `탈퇴가 완료되었습니다.`,
            handleConfirm: signOutAndRedirect,
          });
        } catch (e) {
          console.error('계정 삭제 중 오류:', e);
          handleModalState({
            type: 'ALERT',
            mainText: '탈퇴 처리 중 오류가 발생했습니다.',
            handleConfirm: handleCloseModal,
          });
        }
      },
      handleCancel: handleCloseModal,
    });
  };

  const handleSwitchEnv = (env: 'dev' | 'prod') => {
    handleWebViewMessage('switchEnv', env);
    handleCloseModal();
  };

  const handleEnvSwitchModal = () => {
    handleModalState({
      isShowModal: true,
      type: 'CONFIRM',
      mainText: '개발 환경으로 전환하시겠습니까?',
      confirmBtnName: '개발',
      cancelBtnName: '상용',
      handleConfirm: () => handleSwitchEnv('dev'),
      handleCancel: () => handleSwitchEnv('prod'),
    });
  };

  const screenConfigs: Record<
    Exclude<ScreenType, 'main'>,
    ScreenConfig
  > = useMemo(
    () => createScreenConfigs(handleLogout, handleDeleteAccount, route.push),
    [handleLogout, handleDeleteAccount, route],
  );

  const menuCategories: MenuCategory[] = useMemo(
    () =>
      createMenuCategories(navigateToScreen, route.push, handleEnvSwitchModal),
    [navigateToScreen, route],
  );

  const getHeaderTitle = () => {
    if (currentScreen === 'main') return '보틀노트';
    return (
      screenConfigs[currentScreen as Exclude<ScreenType, 'main'>]?.title ||
      '보틀노트'
    );
  };

  const getHeaderLeftOnClick = () => {
    if (currentScreen === 'main') {
      return () => route.back();
    }
    return navigateBack;
  };

  return (
    <main>
      <div className="relative z-20">
        <SubHeader>
          <SubHeader.Left onClick={getHeaderLeftOnClick()}>
            <Image
              src="/icon/arrow-left-subcoral.svg"
              alt="arrowIcon"
              width={23}
              height={23}
            />
          </SubHeader.Left>
          <SubHeader.Center>{getHeaderTitle()}</SubHeader.Center>
        </SubHeader>
      </div>

      <div className=" bg-white fixed inset-0 flex flex-col pt-[104px]">
        {currentScreen === 'main' ? (
          <SettingsMainScreen menuCategories={menuCategories} />
        ) : (
          <SettingsSubScreen
            screenType={currentScreen as Exclude<ScreenType, 'main'>}
            config={screenConfigs[currentScreen as Exclude<ScreenType, 'main'>]}
          />
        )}
      </div>
      <Modal />
    </main>
  );
}
