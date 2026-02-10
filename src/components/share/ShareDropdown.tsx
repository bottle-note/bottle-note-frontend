'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import OptionDropdown from '@/components/ui/Modal/OptionDropdown';
import { useKakaoShare } from '@/hooks/share/useKakaoShare';
import { useLinkShare } from '@/hooks/share/useLinkShare';
import useModalStore from '@/store/modalStore';
import type { ShareConfig, ShareChannel } from '@/types/share';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import { trackShareEvent, detectPlatform } from '@/utils/share/shareAnalytics';

interface ShareDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  config: ShareConfig;
  onShare?: (channel: ShareChannel, success: boolean) => void;
}

export default function ShareDropdown({
  isOpen,
  onClose,
  config,
  onShare,
}: ShareDropdownProps) {
  const { handleModalState } = useModalStore();
  const [showFallback, setShowFallback] = useState(false);

  const isInApp = typeof window !== 'undefined' && window.isInApp;
  const platform = detectPlatform();

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

    let isResolved = false;

    const handleSuccess = () => {
      if (isResolved) return;
      isResolved = true;

      setShowFallback(false);
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

      setShowFallback(true);
    };

    const handleCancel = () => {
      if (isResolved) return;
      isResolved = true;

      setShowFallback(false);
      onClose();
    };

    window.onShareSuccess = handleSuccess;
    window.onShareError = handleError;
    window.onShareCancel = handleCancel;

    handleWebViewMessage('share', {
      type: config.type,
      contentId: config.contentId,
      title: config.title,
      description: config.description,
      imageUrl: config.imageUrl,
      linkUrl: config.linkUrl,
    });

    // 네이티브 채널 미구현 시 폴백
    const fallbackTimer = setTimeout(() => {
      if (!isResolved) {
        setShowFallback(true);
      }
    }, 500);

    return () => {
      clearTimeout(fallbackTimer);
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

    if (!success) {
      handleModalState({
        isShowModal: true,
        mainText: '카카오톡 공유에 실패했습니다.',
        subText: '링크 복사를 이용해주세요.',
      });
    }
  }, [shareToKakao, config, platform, handleModalState, onShare]);

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
    } else {
      handleModalState({
        isShowModal: true,
        mainText: '링크 복사에 실패했습니다.',
        subText: '',
      });
    }
  }, [copyLink, config, platform, handleModalState, onShare]);

  const handleOptionSelect = useCallback(
    (option: { type: string }) => {
      if (option.type === 'kakao') {
        handleKakaoShare();
      } else if (option.type === 'link') {
        handleCopyLink();
      }
    },
    [handleKakaoShare, handleCopyLink],
  );

  const options = useMemo(() => {
    const list: { type: string; name: string }[] = [];

    if (!showFallback) {
      list.push({
        type: 'kakao',
        name: isKakaoLoading ? '로딩 중...' : '카카오톡으로 공유',
      });
    }

    list.push({ type: 'link', name: '링크 복사' });

    return list;
  }, [showFallback, isKakaoLoading]);

  // In app: don't show anything until fallback is needed
  if (isInApp && !showFallback) return null;

  if (!isOpen) return null;

  return (
    <OptionDropdown
      handleClose={onClose}
      options={options}
      handleOptionSelect={handleOptionSelect}
      title="공유하기"
    />
  );
}
