'use client';

import { useMemo, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useAuth } from '@/hooks/auth/useAuth';
import useModalStore from '@/store/modalStore';
import { useSettingsStore } from '@/store/settingsStore';
import { UserApi } from '@/app/api/UserApi';
import { AdminApi } from '@/app/api/AdminApi';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { ScreenType, ScreenConfig, MenuCategory } from '@/types/Settings';
import { SettingsMainScreen } from './_components/SettingsMainScreen';
import { SettingsSubScreen } from './_components/SettingsSubScreen';
import { createScreenConfigs, createMenuCategories } from './config';

export default function Settings() {
  const route = useRouter();
  const { logout, user, isLoggedIn } = useAuth();
  const { data: session } = useSession();
  const { handleModalState, handleCloseModal } = useModalStore();
  const { currentScreen, setCurrentScreen, resetToMain, clearStorage } =
    useSettingsStore();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminPermissions = async () => {
      if (isLoggedIn) {
        try {
          const hasPermission = await AdminApi.checkPermissions();
          setIsAdmin(hasPermission);
        } catch (error) {
          console.error('Admin permission check failed:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminPermissions();
  }, [isLoggedIn]);

  const checkAuthAndExecute = (callback: () => void) => {
    if (!isLoggedIn) {
      handleModalState({
        isShowModal: true,
        type: 'CONFIRM',
        mainText:
          '로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?',
        confirmBtnName: '로그인',
        handleConfirm: () => {
          handleCloseModal();
          route.push('/login');
        },
      });
      return;
    }
    callback();
  };

  const navigateToScreen = (screen: ScreenType) => {
    checkAuthAndExecute(() => setCurrentScreen(screen));
  };

  const navigateToRoute = (path: string) => {
    checkAuthAndExecute(() => route.push(path));
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
      type: 'CONFIRM',
      mainText: `정말 로그아웃하시겠습니까?`,
      handleConfirm: async () => {
        try {
          await signOutAndRedirect();
        } catch (e) {
          console.error('로그아웃 중 오류:', e);
          handleModalState({
            mainText: '로그아웃 중 오류가 발생했습니다.',
          });
        }
      },
    });
  };

  const handleDeleteAccount = async () => {
    handleModalState({
      isShowModal: true,
      type: 'CONFIRM',
      mainText: `서비스를 탈퇴하시겠습니까?`,
      handleConfirm: async () => {
        try {
          await UserApi.deleteAccount();
          handleModalState({
            mainText: `탈퇴가 완료되었습니다.`,
            handleConfirm: signOutAndRedirect,
          });
        } catch (e) {
          console.error('계정 삭제 중 오류:', e);
          handleModalState({
            mainText: '탈퇴 처리 중 오류가 발생했습니다.',
          });
        }
      },
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
    () => createScreenConfigs(handleLogout, handleDeleteAccount),
    [handleLogout, handleDeleteAccount, route],
  );

  const menuCategories: MenuCategory[] = useMemo(
    () =>
      createMenuCategories(
        navigateToScreen,
        navigateToRoute,
        handleEnvSwitchModal,
        user?.userId,
        isAdmin,
      ),
    [navigateToScreen, navigateToRoute, user?.userId, isAdmin],
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
    </main>
  );
}
