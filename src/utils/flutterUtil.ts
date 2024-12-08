export function checkIsInApp(status: string) {
  const result = status === 'false' ? false : Boolean(status);
  window.isInApp = result;
  return result;
}

export function getDeviceToken(token: string, platform: string) {
  window.deviceInfo = { deviceToken: token, platform };
  return { deviceToken: token, platform };
}

export function sendLogToFlutter(log: string) {
  if (window.isInApp) {
    // 웹뷰일 때 로그 출력
    console.log(`[Message sent to Flutter - WebView] ${log}`);
  } else {
    // 웹뷰가 아닐 때 로그 출력
    console.log(`[Message sent to Flutter - Browser] ${log}`);
  }
  return log;
}

export function handleWebViewMessage(message: string) {
  return window.FlutterMessageQueue.postMessage(message);
}

window.getDeviceToken = getDeviceToken;
window.checkIsInApp = checkIsInApp;
window.sendLogToFlutter = sendLogToFlutter;
