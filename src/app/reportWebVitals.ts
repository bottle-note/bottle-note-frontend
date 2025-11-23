import type { NextWebVitalsMetric } from 'next/app';

const METRIC_ALLOWLIST: ReadonlySet<NextWebVitalsMetric['name']> = new Set([
  'FCP',
  'TTFB',
  'LCP',
  'CLS',
  'FID',
  'INP',
]);

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 12);
};

let sessionId = createSessionId();

const getSessionId = () => {
  if (!sessionId) {
    sessionId = createSessionId();
  }

  return sessionId;
};

const sendMetric = async (payload: Record<string, unknown>) => {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/web-vitals', body);
    return;
  }

  try {
    await fetch('/api/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
    });
  } catch (error) {
    console.warn('Failed to send web vital metric', error);
  }
};

export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (typeof window === 'undefined' || !METRIC_ALLOWLIST.has(metric.name)) {
    return;
  }

  const payload = {
    id: metric.id,
    name: metric.name,
    label: metric.label,
    value: metric.value,
    rating: 'rating' in metric ? metric.rating : undefined,
    page: window.location.pathname,
    url: window.location.href,
    locale: navigator.language,
    userAgent: navigator.userAgent,
    sessionId: getSessionId(),
    timestamp: Date.now(),
  } satisfies Record<string, unknown>;

  void sendMetric(payload);
}
