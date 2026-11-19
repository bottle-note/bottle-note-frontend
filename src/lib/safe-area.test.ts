import { SAFE_AREA_INITIALIZER_SCRIPT, toSafeAreaCssValue } from './safe-area';

describe('앱 safe area 값을 CSS 길이로 변환', () => {
  it.each([0, 24, 40.5, 48])('유효한 높이 %s를 px로 변환한다', (value) => {
    expect(toSafeAreaCssValue(value)).toBe(`${value}px`);
  });

  it.each([undefined, null, '40', -1, NaN, Infinity, -Infinity, {}, true])(
    '잘못된 높이 %s는 사용하지 않는다',
    (value) => {
      expect(toSafeAreaCssValue(value)).toBe('');
    },
  );
});

describe('앱 safe area 초기화 스크립트', () => {
  const rootStyle = document.documentElement.style;
  let eventSubscriptions: jest.SpyInstance;

  beforeEach(() => {
    eventSubscriptions = jest.spyOn(window, 'addEventListener');
  });

  afterEach(() => {
    eventSubscriptions.mock.calls.forEach(([name, listener]) => {
      if (name === 'bottlenote:safearea') {
        window.removeEventListener(name, listener);
      }
    });
    jest.restoreAllMocks();
    delete window.BottleNoteApp;
    rootStyle.removeProperty('--app-safe-area-top');
    rootStyle.removeProperty('--app-safe-area-bottom');
  });

  it.each([undefined, {}])(
    '앱 값이 없으면 시작할 때 스타일을 건드리지 않는다',
    (app) => {
      window.BottleNoteApp = app;
      const setProperty = jest.spyOn(rootStyle, 'setProperty');
      const removeProperty = jest.spyOn(rootStyle, 'removeProperty');

      window.eval(SAFE_AREA_INITIALIZER_SCRIPT);

      expect(setProperty).not.toHaveBeenCalled();
      expect(removeProperty).not.toHaveBeenCalled();
    },
  );

  it('문서 시작에 주입된 앱 값을 동기적으로 html에 반영한다', () => {
    window.BottleNoteApp = { safeArea: { top: 40, bottom: 48 } };

    window.eval(SAFE_AREA_INITIALIZER_SCRIPT);

    expect(rootStyle.getPropertyValue('--app-safe-area-top')).toBe('40px');
    expect(rootStyle.getPropertyValue('--app-safe-area-bottom')).toBe('48px');
  });

  it('높이 변경 이벤트마다 새 값을 반영하고 0도 유지한다', () => {
    window.BottleNoteApp = { safeArea: { top: 40, bottom: 48 } };
    window.eval(SAFE_AREA_INITIALIZER_SCRIPT);

    window.BottleNoteApp.safeArea = { top: 0, bottom: 24.5 };
    window.dispatchEvent(new Event('bottlenote:safearea'));

    expect(rootStyle.getPropertyValue('--app-safe-area-top')).toBe('0px');
    expect(rootStyle.getPropertyValue('--app-safe-area-bottom')).toBe('24.5px');
  });

  it('시작 시 앱 값이 없어도 나중에 받은 이벤트를 반영한다', () => {
    window.eval(SAFE_AREA_INITIALIZER_SCRIPT);

    window.BottleNoteApp = { safeArea: { top: 40, bottom: 48 } };
    window.dispatchEvent(new Event('bottlenote:safearea'));

    expect(rootStyle.getPropertyValue('--app-safe-area-top')).toBe('40px');
    expect(rootStyle.getPropertyValue('--app-safe-area-bottom')).toBe('48px');
  });

  it.each([undefined, null, '40', -1, NaN, Infinity, -Infinity, {}, true])(
    '변경된 높이 %s가 잘못되면 해당 여백만 제거한다',
    (invalidHeight) => {
      window.BottleNoteApp = { safeArea: { top: 40, bottom: 48 } };
      window.eval(SAFE_AREA_INITIALIZER_SCRIPT);

      Object.defineProperty(window.BottleNoteApp.safeArea, 'top', {
        value: invalidHeight,
      });
      window.dispatchEvent(new Event('bottlenote:safearea'));

      expect(rootStyle.getPropertyValue('--app-safe-area-top')).toBe('');
      expect(rootStyle.getPropertyValue('--app-safe-area-bottom')).toBe('48px');
    },
  );

  it('앱 값이 사라진 이벤트는 이전 앱 여백을 제거한다', () => {
    window.BottleNoteApp = { safeArea: { top: 40, bottom: 48 } };
    window.eval(SAFE_AREA_INITIALIZER_SCRIPT);

    delete window.BottleNoteApp;
    window.dispatchEvent(new Event('bottlenote:safearea'));

    expect(rootStyle.getPropertyValue('--app-safe-area-top')).toBe('');
    expect(rootStyle.getPropertyValue('--app-safe-area-bottom')).toBe('');
  });
});
