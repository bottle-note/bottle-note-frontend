// Safe area numbers inside the WebView. Run with cdp-eval.mjs.
(() => {
  const root = getComputedStyle(document.documentElement);
  const px = (value) => {
    const probe = document.createElement('div');
    probe.style.cssText = `position:fixed;top:0;visibility:hidden;height:${value}`;
    document.body.appendChild(probe);
    const height = probe.getBoundingClientRect().height;
    probe.remove();
    return height;
  };
  const fixedAt = (y) => {
    const found = [];
    for (
      let el = document.elementFromPoint(innerWidth / 2, y);
      el && el !== document.body;
      el = el.parentElement
    ) {
      const style = getComputedStyle(el);
      if (style.position === 'fixed' || style.position === 'sticky') {
        const rect = el.getBoundingClientRect();
        found.push({
          tag: el.tagName,
          className: String(el.className).slice(0, 80),
          top: rect.top,
          height: rect.height,
          paddingTop: style.paddingTop,
          paddingBottom: style.paddingBottom,
        });
      }
    }
    return found;
  };
  return {
    path: location.pathname + location.search,
    isInApp: window.isInApp === true,
    innerHeight,
    devicePixelRatio,
    envTop: px('env(safe-area-inset-top, 0px)'),
    envBottom: px('env(safe-area-inset-bottom, 0px)'),
    androidFallbackTop: root.getPropertyValue('--android-safe-area-top').trim(),
    androidFallbackBottom: root
      .getPropertyValue('--android-safe-area-bottom')
      .trim(),
    safeAreaTop: px('var(--safe-area-top)'),
    safeAreaBottom: px('var(--safe-area-bottom)'),
    firstHeaderTop:
      document.querySelector('header')?.getBoundingClientRect().top ?? null,
    fixedAtTop: fixedAt(1),
    fixedAtBottom: fixedAt(innerHeight - 2),
    activeElement:
      document.activeElement?.getAttribute('aria-label') ??
      document.activeElement?.tagName,
  };
})();
