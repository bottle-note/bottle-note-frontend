import { useLayoutEffect, useState } from 'react';
import {
  checkIsInApp,
  getDeviceToken,
  handleWebViewMessage,
  onKakaoLoginError,
  onKakaoLoginSuccess,
  sendLogToFlutter,
} from '@/utils/flutterUtil';

export const useWebViewInit = () => {
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const { userAgent } = navigator;
    const mobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    setIsMobile(mobile);
  }, []);

  const initWebView = () => {
    if (isMobile) {
      handleWebViewMessage('checkIsInApp');
    }

    window.getDeviceToken = getDeviceToken;
    window.checkIsInApp = checkIsInApp;
    window.sendLogToFlutter = sendLogToFlutter;
    window.onKakaoLoginSuccess = onKakaoLoginSuccess;
    window.onKakaoLoginError = onKakaoLoginError;
  };

  return { isMobile, initWebView };
};
