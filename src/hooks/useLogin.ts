'use client';

import { useRouter } from 'next/navigation';
import { DeviceService } from '@/lib/DeviceService';
import useModalStore from '@/store/modalStore';
import { AuthApi } from '@/app/api/AuthApi';
import { ApiError } from '@/utils/ApiError';
import { UserApi } from '@/app/api/UserApi';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { useAuth } from './auth/useAuth';

export type LoginFormValues = {
  email: string;
  password: string;
};

export const useLogin = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { isInApp } = DeviceService;
  const { handleModalState, handleCloseModal } = useModalStore();

  const handleRestore = async (data: LoginFormValues) => {
    try {
      await AuthApi.client.restore(data);
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

  const handleSendDeviceInfo = async () => {
    try {
      if (isInApp && isLoggedIn) {
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

      if (!isInApp && isLoggedIn) {
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

  const handleAppleLogin = async () => {
    if (window.isInApp) {
      const nonce = await AuthApi.client.getAppleNonce();

      return handleWebViewMessage('loginWithApple', { nonce });
    }
    return;
  };

  return {
    handleRestore,
    handleSendDeviceInfo,
    handleInitKakaoSdkLogin,
    handleKakaoLogin,
    handleAppleLogin,
  };
};
