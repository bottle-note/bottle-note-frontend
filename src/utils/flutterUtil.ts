import { DeviceService } from '@/lib/DeviceService';

export function checkIsInApp(status: string) {
  const result = status === 'false' ? false : Boolean(status);
  window.isInApp = result;
  return result;
}

export function getDeviceToken(token: string, platform: string) {
  DeviceService.setDeviceToken(token);
  DeviceService.setPlatform(platform);

  return { deviceToken: token, platform };
}

export function handleWebViewMessage(
  message:
    | 'checkIsInApp'
    | 'deviceToken'
    | 'logToFlutter'
    | 'openAlbum'
    | 'openCamera'
    | 'loginWithKakao',
) {
  return window.FlutterMessageQueue.postMessage(message);
}

export function openAlbum(imgDataBase64: string): string {
  return imgDataBase64;
}

export function sendLogToFlutter(log: string) {
  if (window.isInApp) {
    // 웹뷰일 때 로그 출력
    window.LogToFlutter.postMessage(log);
    console.log(`[Message sent to Flutter - WebView] ${log}`);
  } else {
    // 웹뷰가 아닐 때 로그 출력
    console.log(`[Message sent to Flutter - Browser] ${log}`);
  }
  return log;
}

export function onKakaoLoginSuccess(email: string) {
  console.log(`✅ 카카오 로그인 성공: ${email}`);

  return email;
}

export function onKakaoLoginError(error: string) {
  console.error(`❌ 카카오 로그인 실패: ${error}`);
  // TODO: 오류 메시지 표시 및 처리
}
