export const throttle = (handler: (...args: any[]) => void, timeout = 300) => {
  let lastInvokeTime: number;
  let timer: ReturnType<typeof setTimeout>;

  return function (this: any, ...args: any[]) {
    const currentTime = Date.now();

    if (currentTime - lastInvokeTime >= timeout) {
      handler.apply(this, args);
      lastInvokeTime = currentTime;
    } else {
      clearTimeout(timer);
      timer = setTimeout(
        () => {
          handler.apply(this, args);
          lastInvokeTime = Date.now();
        },
        timeout - (currentTime - lastInvokeTime),
      );
    }
  };
};
