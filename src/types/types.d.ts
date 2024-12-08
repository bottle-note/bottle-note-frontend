declare global {
  interface Window {
    Kakao: any;
    FlutterMessageQueue: {
      postMessage: (payload: any) => any;
    };
     LogToFlutter: {
      postMessage: (payload: any) => any;
    };
    getDeviceToken: (
      token: string,
      platform: string,
    ) => { deviceToken: string; platform: string };
    checkIsInApp: (status: string) => boolean;
    sendLogToFlutter: (log: string) => void;
    isInApp: boolean = false;
    deviceInfo: { deviceToken: string; platform: string };
  }
}

export {};
