import { useEffect, useState } from 'react';
import {
  getDeviceToken,
  handleWebViewMessage,
  sendLogToFlutter,
  checkPlatform,
} from '@/utils/flutterUtil';
import { useSocialLogin } from './useSocialLogin';

export const useWebViewInit = () => {
  const {
    onKakaoAppLoginSuccess,
    onKakaoAppLoginError,
    onAppleAppLoginSuccess,
    onAppleAppLoginError,
  } = useSocialLogin();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (typeof window.isInApp !== 'undefined') {
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
    window.onKakaoLoginSuccess = onKakaoAppLoginSuccess;
    window.onKakaoLoginError = onKakaoAppLoginError;
    window.onAppleLoginSuccess = onAppleAppLoginSuccess;
    window.onAppleLoginError = onAppleAppLoginError;

    if (isMobile) {
      handleWebViewMessage('checkPlatform');
    }
  };

  return { isMobile, initWebView };
};
