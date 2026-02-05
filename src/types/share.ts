// 공유 콘텐츠 타입
export type ShareContentType = 'review' | 'whisky' | 'event';

// 공유 채널
export type ShareChannel = 'kakao' | 'link' | 'native';

// 공유 플랫폼
export type SharePlatform = 'web' | 'app-ios' | 'app-android';

// 공유 설정
export interface ShareConfig {
  /** 공유할 콘텐츠 타입 */
  type: ShareContentType;
  /** 콘텐츠 ID (리뷰 ID, 위스키 ID 등) */
  contentId: string;
  /** 공유 제목 */
  title: string;
  /** 공유 설명 */
  description: string;
  /** OG 이미지 URL */
  imageUrl: string;
  /** 공유될 링크 URL */
  linkUrl: string;
  /** 카카오톡 버튼 텍스트 (기본값: '자세히 보기') */
  buttonTitle?: string;
}

// 공유 결과
export interface ShareResult {
  success: boolean;
  channel: ShareChannel;
  error?: string;
}

// 공유 Analytics 이벤트
export interface ShareAnalyticsEvent {
  contentType: ShareContentType;
  contentId: string;
  channel: ShareChannel;
  platform: SharePlatform;
}
