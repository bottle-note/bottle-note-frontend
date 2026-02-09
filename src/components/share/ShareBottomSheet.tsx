'use client';

import { useCallback, useEffect, useState } from 'react';

import BackDrop from '@/components/ui/Modal/BackDrop';
import { useKakaoShare } from '@/hooks/share/useKakaoShare';
import { useLinkShare } from '@/hooks/share/useLinkShare';
import useModalStore from '@/store/modalStore';
import type { ShareConfig, ShareChannel } from '@/types/share';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { trackShareEvent, detectPlatform } from '@/utils/share/shareAnalytics';

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

    // 앱에서는 네이티브 콜백(success/error/cancel)을 신뢰
    let isResolved = false;

    // Register callbacks
    const handleSuccess = () => {
      if (isResolved) return;
      isResolved = true;

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

    const handleError = (_error?: string) => {
      if (isResolved) return;
      isResolved = true;

      // Show fallback bottom sheet
      setShowFallback(true);
    };

    const handleCancel = () => {
      if (isResolved) return;
      isResolved = true;

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

    return () => {
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
