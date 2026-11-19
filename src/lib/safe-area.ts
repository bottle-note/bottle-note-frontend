export function toSafeAreaCssValue(value: unknown): string {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? `${value}px`
    : '';
}

// Q1: 앱이 문서 시작에 주입한 값을 첫 페인트 전에 반영한다.
export const SAFE_AREA_INITIALIZER_SCRIPT = `
  (() => {
    const toCssValue = ${toSafeAreaCssValue.toString()};
    const root = document.documentElement;

    const applySafeArea = () => {
      const safeArea = window.BottleNoteApp?.safeArea;
      for (const edge of ['top', 'bottom']) {
        const property = '--app-safe-area-' + edge;
        const value = toCssValue(safeArea?.[edge]);
        if (value) root.style.setProperty(property, value);
        else root.style.removeProperty(property);
      }
    };

    if (window.BottleNoteApp?.safeArea) applySafeArea();
    window.addEventListener('bottlenote:safearea', applySafeArea);
  })();
`;
