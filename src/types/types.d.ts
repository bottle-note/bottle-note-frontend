declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'set',
      targetId: string,
      params?: Record<string, unknown>,
    ) => void;
    kakao: any;
    Kakao: any;
    FlutterMessageQueue: {
      postMessage: (message: string, args?: any) => any;
    };
     LogToFlutter: {
      postMessage: (payload: string) => any;
    };
    getDeviceToken: (
      token: string,
      platform: string,
    ) => { deviceToken: string; platform: string };
    checkIsInApp: (status: string) => boolean;
    checkPlatform: (platform:string) => string;
    openAlbum:(imageDataBase64: string) => void; 
    sendLogToFlutter: (log: string) => void;
    onKakaoLoginSuccess:(email: string) => Promise<void>;
    onKakaoLoginError:(error: string) => void;
    onAppleLoginSuccess:(data: string) => Promise<void>;
    onAppleLoginError:(error: string) => void;
    isInApp: boolean = false;
    deviceToken: string;
    platform: string
  }

  declare module '*.svg' {
    const content: string | StaticImageData;
    export default content;
  }

  declare module '*.png' {
    const content: string | StaticImageData;
    export default content;
  }
}

export {};