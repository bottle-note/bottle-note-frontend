'use client';

import { DeviceService } from '@/lib/DeviceService';
import useModalStore from '@/store/modalStore';
import { AuthApi } from '@/api/auth/auth.api';
import { ApiError } from '@/utils/ApiError';
import { UserApi } from '@/api/user/user.api';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { useAuth } from './auth/useAuth';

export type LoginFormValues = {
  email: string;
  password: string;
};

export const useLogin = () => {
  const { isLoggedIn } = useAuth();
  const { isInApp } = DeviceService;
  const { handleModalState } = useModalStore();

  const handleRestore = async (data: LoginFormValues) => {
    try {
      await AuthApi.client.restore(data);
      handleModalState({
        isShowModal: true,
        mainText: `재가입에 성공하였습니다.`,
      });
    } catch (error) {
      handleModalState({
        isShowModal: true,
        mainText: `${(error as unknown as ApiError).message}`,
      });
    }
  };

  const handleSendDeviceInfo = async () => {
    // 인앱 환경에서 로그인된 경우에만 디바이스 정보 전송
    // 리다이렉트는 호출하는 쪽에서 처리 (중복 리다이렉트 방지)
    if (!isInApp || !isLoggedIn) return;

    try {
      const result = await UserApi.sendDeviceInfo({
        deviceToken: DeviceService.deviceToken || '',
        platform: DeviceService.platform || '',
      });

      window.sendLogToFlutter(
        `${result.data.message} / ${result.data.deviceToken} / ${result.data.platform}`,
      );
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
