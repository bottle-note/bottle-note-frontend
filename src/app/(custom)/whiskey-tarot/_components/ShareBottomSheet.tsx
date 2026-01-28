'use client';

import { useEffect, useState, useCallback } from 'react';

import { useKakaoShare } from '@/hooks/share/useKakaoShare';
import { useLinkShare } from '@/hooks/share/useLinkShare';
import useModalStore from '@/store/modalStore';

interface ShareBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHARE_CONFIG = {
  title: '위스키 타로 - 나에게 맞는 위스키는?',
  description: '타로 카드로 알아보는 나만의 위스키 추천',
  buttonTitle: '타로 보러 가기',
};

export default function ShareBottomSheet({
  isOpen,
  onClose,
}: ShareBottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { handleModalState } = useModalStore();

  // 모듈화된 공유 훅 사용
  const { shareToKakao, isLoading: isKakaoLoading } = useKakaoShare({
    preload: isOpen, // 바텀시트 열릴 때 SDK 미리 로드
  });
  const { copyLink } = useLinkShare();

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/whiskey-tarot`
      : '';
  // Next.js opengraph-image.tsx가 자동 생성하는 경로
  const ogImageUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/whiskey-tarot/opengraph-image`
      : '';

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleKakaoShare = useCallback(async () => {
    const success = await shareToKakao({
      title: SHARE_CONFIG.title,
      description: SHARE_CONFIG.description,
      imageUrl: ogImageUrl,
      linkUrl: shareUrl,
      buttonTitle: SHARE_CONFIG.buttonTitle,
    });

    if (success) {
      handleClose();
    } else {
      handleModalState({
        isShowModal: true,
        mainText: '카카오톡 공유에 실패했습니다.',
        subText: '링크 복사를 이용해주세요.',
      });
    }
  }, [shareToKakao, shareUrl, ogImageUrl, handleClose, handleModalState]);

  const handleCopyLink = useCallback(async () => {
    const success = await copyLink(shareUrl);

    if (success) {
      handleModalState({
        isShowModal: true,
        mainText: '링크가 복사되었습니다.',
        subText: '친구에게 공유해보세요!',
      });
      handleClose();
    } else {
      handleModalState({
        isShowModal: true,
        mainText: '링크 복사에 실패했습니다.',
        subText: '',
      });
    }
  }, [copyLink, shareUrl, handleClose, handleModalState]);

  if (!isAnimating && !isOpen) return null;

  return (
    <>
      {/* 백드롭 */}
      <div
        className={`
          fixed inset-0 bg-black/60 z-50 transition-opacity duration-300
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleClose}
      />

      {/* 바텀시트 */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-gradient-to-b from-[#1a1a1f] to-[#0a0a0f]
          rounded-t-3xl border-t border-white/10
          transition-transform duration-300 ease-out
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* 핸들 바 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* 타이틀 */}
        <div className="px-6 pt-2 pb-4">
          <h3 className="text-white text-lg font-bold text-center">
            친구에게 추천하기
          </h3>
          <p className="text-white/50 text-sm text-center mt-1">
            타로로 위스키를 추천받아 보세요
          </p>
        </div>

        {/* 공유 옵션들 - 카카오톡 + 링크복사만 */}
        <div className="flex justify-center gap-8 px-6 pb-6">
          {/* 카카오톡 */}
          <button
            onClick={handleKakaoShare}
            disabled={isKakaoLoading}
            className="flex flex-col items-center gap-2 group disabled:opacity-50"
          >
            <div className="w-14 h-14 rounded-full bg-[#FEE500] flex items-center justify-center group-active:scale-95 transition-transform">
              {isKakaoLoading ? (
                <div className="w-5 h-5 border-2 border-[#3C1E1E]/30 border-t-[#3C1E1E] rounded-full animate-spin" />
              ) : (
                <KakaoIcon />
              )}
            </div>
            <span className="text-white/70 text-xs">카카오톡</span>
          </button>

          {/* 링크 복사 */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
              <LinkIcon />
            </div>
            <span className="text-white/70 text-xs">링크 복사</span>
          </button>
        </div>

        {/* Safe area padding */}
        <div className="pb-safe-bottom" />
      </div>
    </>
  );
}

function KakaoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3C6.477 3 2 6.463 2 10.691c0 2.725 1.792 5.115 4.483 6.457l-.98 3.603c-.09.328.283.597.566.408l4.15-2.767c.583.073 1.178.111 1.781.111 5.523 0 10-3.463 10-7.812C22 6.463 17.523 3 12 3z"
        fill="#3C1E1E"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
