'use client';

import { useCallback, useEffect, useState } from 'react';

import BackDrop from '@/components/ui/Modal/BackDrop';
import { useKakaoShare } from '@/hooks/share/useKakaoShare';
import { useLinkShare } from '@/hooks/share/useLinkShare';
import useModalStore from '@/store/modalStore';
import type { ShareConfig, ShareChannel } from '@/types/share';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { trackShareEvent, detectPlatform } from '@/utils/share/shareAnalytics';

// 브릿지 지원 여부 체크 - window.FlutterMessageQueue.postMessage가 함수인지 확인
const checkBridgeSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return typeof window.FlutterMessageQueue?.postMessage === 'function';
};

interface ShareBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  config: ShareConfig;
  onShare?: (channel: ShareChannel, success: boolean) => void;
}

export default function ShareBottomSheet({
  isOpen,
  onClose,
  config,
  onShare,
}: ShareBottomSheetProps) {
  const { handleModalState } = useModalStore();
  const [showFallback, setShowFallback] = useState(false);

  // Check if running in app
  const isInApp = typeof window !== 'undefined' && window.isInApp;
  const platform = detectPlatform();

  // 모듈화된 공유 훅 사용
  const { shareToKakao, isLoading: isKakaoLoading } = useKakaoShare({
    preload: isOpen,
  });
  const { copyLink } = useLinkShare();

  // App: Auto-trigger native share when opened
  useEffect(() => {
    if (!isOpen || !isInApp) {
      setShowFallback(false);
      return;
    }

    // 브릿지 미지원 시 즉시 폴백
    if (!checkBridgeSupport()) {
      setShowFallback(true);
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;
    let isResolved = false;

    const clearFallbackTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    // Register callbacks
    const handleSuccess = () => {
      if (isResolved) return;
      isResolved = true;
      clearFallbackTimeout();

      trackShareEvent({
        contentType: config.type,
        contentId: config.contentId,
        channel: 'native',
        platform,
        success: true,
      });
      onShare?.('native', true);
      onClose();
    };

    const handleError = () => {
      if (isResolved) return;
      isResolved = true;
      clearFallbackTimeout();

      // Show fallback bottom sheet
      setShowFallback(true);
    };

    const handleCancel = () => {
      if (isResolved) return;
      isResolved = true;
      clearFallbackTimeout();

      // User cancelled, just close
      onClose();
    };

    window.onShareSuccess = handleSuccess;
    window.onShareError = handleError;
    window.onShareCancel = handleCancel;

    // Trigger native share
    handleWebViewMessage('share', {
      type: config.type,
      contentId: config.contentId,
      title: config.title,
      description: config.description,
      imageUrl: config.imageUrl,
      linkUrl: config.linkUrl,
    });

    // 타임아웃: 1초 후에도 응답 없으면 폴백 표시
    timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        setShowFallback(true);
      }
    }, 1000);

    return () => {
      clearFallbackTimeout();
      // Cleanup callbacks
      window.onShareSuccess = () => {};
      window.onShareError = () => {};
      window.onShareCancel = () => {};
    };
  }, [isOpen, isInApp, config, platform, onShare, onClose]);

  const handleKakaoShare = useCallback(async () => {
    const success = await shareToKakao({
      title: config.title,
      description: config.description,
      imageUrl: config.imageUrl,
      linkUrl: config.linkUrl,
      buttonTitle: config.buttonTitle,
    });

    onShare?.('kakao', success);

    trackShareEvent({
      contentType: config.type,
      contentId: config.contentId,
      channel: 'kakao',
      platform,
      success,
    });

    if (success) {
      onClose();
    } else {
      handleModalState({
        isShowModal: true,
        mainText: '카카오톡 공유에 실패했습니다.',
        subText: '링크 복사를 이용해주세요.',
      });
    }
  }, [shareToKakao, config, platform, onClose, handleModalState, onShare]);

  const handleCopyLink = useCallback(async () => {
    const success = await copyLink(config.linkUrl);

    onShare?.('link', success);

    trackShareEvent({
      contentType: config.type,
      contentId: config.contentId,
      channel: 'link',
      platform,
      success,
    });

    if (success) {
      handleModalState({
        isShowModal: true,
        mainText: '링크가 복사되었습니다.',
        subText: '친구에게 공유해보세요!',
      });
      onClose();
    } else {
      handleModalState({
        isShowModal: true,
        mainText: '링크 복사에 실패했습니다.',
        subText: '',
      });
    }
  }, [copyLink, config, platform, onClose, handleModalState, onShare]);

  // In app: don't show anything until fallback is needed
  if (isInApp && !showFallback) return null;

  // Web or app fallback: show bottom sheet
  if (!isOpen) return null;

  return (
    <BackDrop isShow={isOpen} onBackdropClick={onClose}>
      <div className="content-container h-full flex flex-col justify-end items-center px-4 gap-3 pb-7">
        <section className="w-full bg-white rounded-xl divide-y overflow-hidden">
          <article className="py-4 text-center text-mainGray text-sm">
            공유하기
          </article>

          <button
            onClick={handleKakaoShare}
            disabled={isKakaoLoading}
            className="block w-full py-4 text-center text-subCoral disabled:opacity-50"
          >
            {isKakaoLoading ? '로딩 중...' : '카카오톡으로 공유'}
          </button>

          <button
            onClick={handleCopyLink}
            className="block w-full py-4 text-center text-subCoral"
          >
            링크 복사
          </button>
        </section>

        <button className="w-full bg-white rounded-xl py-4" onClick={onClose}>
          닫기
        </button>
      </div>
    </BackDrop>
  );
}
