import {
  checkIsInApp,
  getDeviceToken,
  handleWebViewMessage,
  sendLogToFlutter,
} from '@/utils/flutterUtil';

export const useWebViewInit = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
