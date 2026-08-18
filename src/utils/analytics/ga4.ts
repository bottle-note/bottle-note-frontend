import { sendGTMEvent } from '@next/third-parties/google';
import type { GA4EventMap, GA4EventName } from '@/utils/analytics/types';

/**
 * GTM dataLayer를 통해 GA4 이벤트를 전송한다.
 * SSR 환경에서는 안전하게 무시된다.
 */
export function trackGA4Event<E extends GA4EventName>(
  eventName: E,
  ...args: GA4EventMap[E] extends Record<string, never>
    ? []
    : [params: GA4EventMap[E]]
): void {
  if (typeof window === 'undefined') return;

  const params = args[0] as Record<string, unknown> | undefined;
  sendGTMEvent({ event: eventName, ...params });
}
