declare global {
  interface Window {
    Kakao: any;
    FlutterMessageQueue: {
      postMessage: (payload: any) => any;
    };
    getDeviceToken: (
      token: string,
      platform: string,
    ) => { token: string; platform: string };
  }
}

export {};
