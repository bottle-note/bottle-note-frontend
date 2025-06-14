import { useEffect, useState } from 'react';
import {
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

    if (window.isInApp) {
      setIsMobile(window.isInApp);
    } else {
      setIsMobile(null);
    }
  }, []);

  const initWebView = () => {
    if (typeof window === 'undefined') return;

    window.getDeviceToken = getDeviceToken;
    window.checkPlatform = checkPlatform;
    window.sendLogToFlutter = sendLogToFlutter;
    window.onKakaoLoginSuccess = onKakaoLoginSuccess;
    window.onKakaoLoginError = onKakaoLoginError;
    window.onAppleLoginSuccess = onAppleLoginSuccess;
    window.onAppleLoginError = onAppleLoginError;

    if (isMobile) {
      handleWebViewMessage('checkPlatform');
    }
  };

  return { isMobile, initWebView };
};
