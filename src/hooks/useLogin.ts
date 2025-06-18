'use client';

import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { AuthService } from '@/lib/AuthService';
import { DeviceService } from '@/lib/DeviceService';
import useModalStore from '@/store/modalStore';
import { AuthApi } from '@/app/api/AuthApi';
import { ApiError } from '@/utils/ApiError';
import { UserData } from '@/types/Auth';
import { UserApi } from '@/app/api/UserApi';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { ROUTES } from '@/constants/routes';

const jwt = require('jsonwebtoken');

export type LoginFormValues = {
  email: string;
  password: string;
};

export const useLogin = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { isLogin, login } = AuthService;
  const { isInApp } = DeviceService;
  const { handleModalState, handleCloseModal } = useModalStore();

  const handleRestore = async (data: LoginFormValues) => {
    try {
      await AuthApi.restore(data);
      handleModalState({
        isShowModal: true,
        type: 'ALERT',
        mainText: `재가입에 성공하였습니다.`,
        handleConfirm: () => {
          handleCloseModal();
        },
      });
    } catch (error) {
      handleModalState({
        isShowModal: true,
        type: 'ALERT',
        mainText: `${(error as unknown as ApiError).message}`,
        handleConfirm: () => {
          handleCloseModal();
        },
      });
    }
  };

  const handleBasicLogin = async (data: LoginFormValues) => {
    try {
      const result = await AuthApi.basicLogin(data);

      const decoded: UserData = jwt.decode(result.accessToken);

      login(decoded, {
        accessToken: result.accessToken,
        refreshToken: '',
      });

      router.push(ROUTES.HOME);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'USER_DELETED') {
        return handleModalState({
          isShowModal: true,
          type: 'CONFIRM',
          mainText: `${`탈퇴한 유저입니다. 재가입하시겠습니까?`}`,
          handleConfirm: async () => {
            handleCloseModal();
            await handleRestore(data);
          },
        });
      }

      handleModalState({
        isShowModal: true,
        mainText: `${(error as unknown as Error).message}`,
        handleConfirm: () => {
          handleCloseModal();
        },
      });
    }
  };

  const handleRedirectWithSession = () => {
    if (session && session.user) {
      const { userId, email, profile, accessToken, refreshToken } =
        session.user;

      AuthService.login(
        {
          userId,
          sub: email,
          profile,
        },
        {
          accessToken,
          refreshToken,
        },
      );

      router.replace('/');
    }
  };

  const handleSendDeviceInfo = async () => {
    try {
      if (isInApp && isLogin) {
        const result = await UserApi.sendDeviceInfo(
          DeviceService.deviceToken || '',
          DeviceService.platform || '',
        );

        window.sendLogToFlutter(
          `${result.data.message} / ${result.data.deviceToken} / ${result.data.platform}`,
        );
        router.replace('/');
        return;
      }

      if (!isInApp && isLogin) {
        router.replace('/');
      }
    } catch (e) {
      window.sendLogToFlutter((e as Error).message);
    }
  };

  const handleInitKakaoSdkLogin = () => {
    const kakaoSDK = document.createElement('script');
    kakaoSDK.async = false;
    kakaoSDK.src = `https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js`;
    kakaoSDK.integrity = process.env.NEXT_PUBLIC_KAKAO_INTEGRITY_HASH!;
    kakaoSDK.crossOrigin = `anonymous`;
    document.head.appendChild(kakaoSDK);

    const onLoadKakaoAPI = () => {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID);

        console.log('Kakao SDK Initialized: ', window.Kakao.isInitialized());
      }
    };

    kakaoSDK.addEventListener('load', onLoadKakaoAPI);
  };

  const handleKakaoLogin = () => {
    if (window.isInApp) {
      return handleWebViewMessage('loginWithKakao');
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_CLIENT_URL}/oauth/kakao`;
    window.Kakao.Auth.authorize({
      redirectUri,
    });
  };

  const handleAppleLogin = () => {
    if (window.isInApp) {
      return handleWebViewMessage('loginWithApple');
    }

    return signIn('apple');
  };

  return {
    handleRestore,
    handleBasicLogin,
    handleRedirectWithSession,
    handleSendDeviceInfo,
    handleInitKakaoSdkLogin,
    handleKakaoLogin,
    handleAppleLogin,
  };
};
