import type { NextWebVitalsMetric } from 'next/app';

const METRIC_ALLOWLIST: ReadonlySet<NextWebVitalsMetric['name']> = new Set([
  'FCP',
  'TTFB',
  'LCP',
  'CLS',
  'FID',
  'INP',
]);

export function reportWebVitals(metric: NextWebVitalsMetric) {
  const value = Math.round(
    metric.name === 'CLS' ? metric.value * 1000 : metric.value,
  );

  window.gtag('event', metric.name, {
    value,
    event_label: metric.id,
    metric_value: metric.value,
    metric_delta: 'delta' in metric ? metric.delta : undefined,
    metric_rating: 'rating' in metric ? metric.rating : undefined,
    page_path: window.location.pathname,
    non_interaction: true,
  });
}
