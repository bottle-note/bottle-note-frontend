import { useEffect, useState } from 'react';
import {
  checkIsInApp,
  getDeviceToken,
  handleWebViewMessage,
  sendLogToFlutter,
  checkPlatform,
} from '@/utils/flutterUtil';
import { useAppSocialLogin } from './useAppSocialLogin';

export const useWebViewInit = () => {
  const {
    onKakaoLoginSuccess,
    onKakaoLoginError,
    onAppleLoginSuccess,
    onAppleLoginError,
  } = useAppSocialLogin();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const { userAgent } = navigator;
    const mobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    setIsMobile(mobile);
  }, []);

  const initWebView = () => {
    if (typeof window === 'undefined') return;

    window.getDeviceToken = getDeviceToken;
    window.checkIsInApp = checkIsInApp;
    window.checkPlatform = checkPlatform;
    window.sendLogToFlutter = sendLogToFlutter;
    window.onKakaoLoginSuccess = onKakaoLoginSuccess;
    window.onKakaoLoginError = onKakaoLoginError;
    window.onAppleLoginSuccess = onAppleLoginSuccess;
    window.onAppleLoginError = onAppleLoginError;

    if (isMobile) {
      handleWebViewMessage('checkIsInApp');
      handleWebViewMessage('checkPlatform');
    }
  };

  return { isMobile, initWebView };
};
