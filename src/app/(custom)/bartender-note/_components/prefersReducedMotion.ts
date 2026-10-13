/** 사용자가 기기에서 '동작 줄이기'를 켰는지. 브라우저에서만 읽으므로 effect나 이벤트 핸들러 안에서 부른다. */
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
