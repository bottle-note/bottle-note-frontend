import type { GA4EventMap, GA4EventName } from '@/utils/analytics/types';

/**
 * GA4 이벤트를 전송한다.
 * SSR 환경 및 gtag 미로딩 상태에서 안전하게 무시된다.
 */
export function trackGA4Event<E extends GA4EventName>(
  eventName: E,
  ...args: GA4EventMap[E] extends Record<string, never>
    ? []
    : [params: GA4EventMap[E]]
): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  const params = args[0];
  if (params && Object.keys(params).length > 0) {
    window.gtag('event', eventName, params as Record<string, unknown>);
  } else {
    window.gtag('event', eventName);
  }
}
