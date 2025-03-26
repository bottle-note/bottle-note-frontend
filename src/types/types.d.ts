declare global {
  interface Window {
    kakao: any;
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
    openAlbum:(imageDataBase64: string) => void; 
    sendLogToFlutter: (log: string) => void;
    onKakaoLoginSuccess:(email: string) => Promise<void>;
    onKakaoLoginError:(error: string) => void;
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