declare global {
  interface Window {
    Kakao: any;
    FlutterMessageQueue: {
      postMessage: (payload: any) => any;
    };
  }
}

export {};
