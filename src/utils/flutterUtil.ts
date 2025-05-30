import { DeviceService } from '@/lib/DeviceService';

export function checkIsInApp(status: string) {
  const result = status === 'false' ? false : Boolean(status);
  window.isInApp = result;
  DeviceService.setIsInApp(result);

  return result;
}

export function checkPlatform(platform: string) {
  window.platform = platform;
  DeviceService.setPlatform(platform);

  return platform;
}

export function getDeviceToken(token: string, platform: string) {
  DeviceService.setDeviceToken(token);

  return { deviceToken: token, platform };
}

export function handleWebViewMessage(
  message:
    | 'checkIsInApp'
    | 'checkPlatform'
    | 'deviceToken'
    | 'logToFlutter'
    | 'openAlbum'
    | 'openCamera'
    | 'loginWithKakao'
    | 'loginWithApple',
) {
  return window.FlutterMessageQueue.postMessage(message);
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
