import { DeviceService } from '@/lib/DeviceService';

export function checkPlatform(platform: string) {
  window.platform = platform;
  DeviceService.setPlatform(platform);

  return platform;
}

export function getDeviceToken(token: string, platform: string) {
  DeviceService.setDeviceToken(token);

  return { deviceToken: token, platform };
}

type WebViewMessageType = {
  checkPlatform: {
    message: 'checkPlatform';
    args?: never;
  };
  deviceToken: {
    message: 'deviceToken';
    args?: never;
  };
  logToFlutter: {
    message: 'logToFlutter';
    args: { log: string };
  };
  openAlbum: {
    message: 'openAlbum';
    args?: never;
  };
  openAlbumMultiple: {
    message: 'openAlbumMultiple';
    args?: never;
  };
  openCamera: {
    message: 'openCamera';
    args?: never;
  };
  loginWithKakao: {
    message: 'loginWithKakao';
    args?: never;
  };
  loginWithApple: {
    message: 'loginWithApple';
    args?: { nonce: string };
  };
  switchEnv: {
    message: 'switchEnv';
    args?: 'dev' | 'prod';
  };
  triggerHaptic: {
    message: 'triggerHaptic';
    args?: { type: 'light' | 'medium' | 'heavy' | 'selection' | 'vibrate' };
  };
  share: {
    message: 'share';
    args: {
      linkUrl: string;
    };
  };
};

type WebViewMessage = WebViewMessageType[keyof WebViewMessageType];

export function handleWebViewMessage<T extends WebViewMessage['message']>(
  message: T,
  args?: WebViewMessageType[T]['args'],
) {
  if (!window.isInApp) return;
  window.FlutterMessageQueue.postMessage(message, args);
}

export function openAlbum(imgDataBase64: string): string {
  return imgDataBase64;
}

export function sendLogToFlutter(log: string) {
  if (window.isInApp) {
    window.LogToFlutter.postMessage(log);
    console.log(`[Message sent to Flutter - WebView] ${log}`);
  } else {
    console.log(`[Message sent to Flutter - Browser] ${log}`);
  }
  return log;
}
