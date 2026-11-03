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
  const isReviewEvent =
    eventName === 'write_review_start' ||
    eventName === 'write_review_complete' ||
    eventName === 'write_review_failed';
  // GTM 데이터 영역 값은 다음 이벤트에도 남으므로 일반 리뷰에서는 이전 바텐더 경로를 명시적으로 비운다.
  const reviewContext = isReviewEvent
    ? { source: params?.source ?? null, entry_flow: params?.entry_flow ?? null }
    : {};
  sendGTMEvent({ event: eventName, ...params, ...reviewContext });
}
