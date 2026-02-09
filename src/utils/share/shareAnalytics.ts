import type {
  ShareContentType,
  ShareChannel,
  SharePlatform,
} from '@/types/share';

interface ShareEventParams {
  contentType: ShareContentType;
  contentId: string;
  channel: ShareChannel;
  platform: SharePlatform;
  success: boolean;
}

/**
 * 공유 이벤트 추적
 *
 * @example
 * trackShareEvent({
 *   contentType: 'review',
 *   contentId: '123',
 *   channel: 'kakao',
 *   platform: 'web',
 *   success: true,
 * });
 */
export function trackShareEvent(params: ShareEventParams): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'share', {
    content_type: params.contentType,
    content_id: params.contentId,
    share_channel: params.channel,
    platform: params.platform,
    share_success: params.success,
  });
}

/**
 * 플랫폼 감지
 */
export function detectPlatform(): SharePlatform {
  if (typeof window === 'undefined') return 'web';

  if (window.isInApp) {
    const platform = window.platform?.toLowerCase() || '';
    if (platform.includes('ios') || platform.includes('iphone'))
      return 'app-ios';
    if (platform.includes('android')) return 'app-android';
  }

  return 'web';
}
