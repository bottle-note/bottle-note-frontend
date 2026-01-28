/**
 * 카카오 SDK 타입 정의
 */

// 카카오 템플릿 링크
export interface KakaoTemplateLink {
  webUrl?: string;
  mobileWebUrl?: string;
  androidExecutionParams?: Record<string, string>;
  iosExecutionParams?: Record<string, string>;
}

// 카카오 템플릿 콘텐츠
export interface KakaoTemplateContent {
  title: string;
  imageUrl: string;
  link: KakaoTemplateLink;
  description?: string;
  imageWidth?: number;
  imageHeight?: number;
}

// 카카오 템플릿 버튼
export interface KakaoTemplateButton {
  title: string;
  link: KakaoTemplateLink;
}

// 카카오 템플릿 소셜 정보
export interface KakaoTemplateSocial {
  likeCount?: number;
  commentCount?: number;
  sharedCount?: number;
  viewCount?: number;
  subscriberCount?: number;
}

// 카카오 Feed 템플릿
export interface KakaoFeedTemplate {
  objectType: 'feed';
  content: KakaoTemplateContent;
  itemContent?: {
    profileText?: string;
    profileImageUrl?: string;
    titleImageText?: string;
    titleImageUrl?: string;
    titleImageCategory?: string;
    items?: Array<{ item: string; itemOp: string }>;
    sum?: string;
    sumOp?: string;
  };
  social?: KakaoTemplateSocial;
  buttons?: KakaoTemplateButton[];
  buttonTitle?: string;
}

// 카카오 공유 옵션 (간소화된 버전)
export interface KakaoShareOptions {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  buttonTitle?: string;
}

// window.Kakao 타입 확장
declare global {
  interface Window {
    Kakao: {
      // 기존 코드 호환성을 위해 undefined 허용 (런타임에서 검증)
      init: (appKey: string | undefined) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (settings: KakaoFeedTemplate) => void;
        sendCustom: (settings: {
          templateId: number;
          templateArgs?: Record<string, string>;
        }) => void;
        sendScrap: (settings: { requestUrl: string }) => void;
      };
      Auth: {
        authorize: (settings: { redirectUri: string }) => void;
      };
    };
  }
}

export {};
