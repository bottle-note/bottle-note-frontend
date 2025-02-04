import { useEffect, useState } from 'react';
import {
  checkIsInApp,
  getDeviceToken,
  handleWebViewMessage,
  sendLogToFlutter,
} from '@/utils/flutterUtil';

export const useWebViewInit = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
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
  };

  return { isMobile, initWebView };
};
