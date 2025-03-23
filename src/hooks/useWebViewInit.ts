import { useEffect, useState } from 'react';
import {
  checkIsInApp,
  getDeviceToken,
  handleWebViewMessage,
  onKakaoLoginError,
  onKakaoLoginSuccess,
  sendLogToFlutter,
} from '@/utils/flutterUtil';

export const useWebViewInit = () => {
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
    window.sendLogToFlutter = sendLogToFlutter;
    window.onKakaoLoginSuccess = onKakaoLoginSuccess;
    window.onKakaoLoginError = onKakaoLoginError;

    if (isMobile) {
      handleWebViewMessage('checkIsInApp');
    }
  };

  return { isMobile, initWebView };
};
