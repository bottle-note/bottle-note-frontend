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
    openAlbum:(imageDataBase64:string) => void; // FIXME: 통신 과정 확인하고 리턴값 수정
    sendLogToFlutter: (log: string) => void;
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