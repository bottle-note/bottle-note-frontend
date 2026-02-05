import type { ShareConfig, ShareResult } from '@/types/share';

/**
 * 네이티브 앱 공유 브릿지 인터페이스
 *
 * 앱 팀에서 구현해야 할 네이티브 공유 기능
 */
export interface NativeShareBridge {
  /**
   * 네이티브 공유 시트 열기
   * @param config 공유 설정
   * @returns 공유 결과
   */
  share(config: ShareConfig): Promise<ShareResult>;

  /**
   * 네이티브 공유 가능 여부 확인
   * @returns 공유 가능 여부
   */
  isAvailable(): boolean;
}

/**
 * Window 객체 확장
 *
 * 앱 환경에서 WebView를 통해 주입되는 네이티브 브릿지
 */
declare global {
  interface Window {
    BottleNote?: {
      share: NativeShareBridge;
    };
  }
}

export {};
