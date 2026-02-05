'use client';

import ShareBottomSheet from '@/components/share/ShareBottomSheet';
import type { ShareConfig, ShareChannel } from '@/types/share';

interface TarotShareBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHARE_CONFIG: Omit<ShareConfig, 'linkUrl' | 'imageUrl'> = {
  type: 'event',
  contentId: 'whiskey-tarot',
  title: '위스키 타로 - 나에게 맞는 위스키는?',
  description: '타로 카드로 알아보는 나만의 위스키 추천',
  buttonTitle: '타로 보러 가기',
};

export default function TarotShareBottomSheet({
  isOpen,
  onClose,
}: TarotShareBottomSheetProps) {
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/whiskey-tarot`
      : '';
  const ogImageUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/whiskey-tarot/opengraph-image`
      : '';

  const config: ShareConfig = {
    ...SHARE_CONFIG,
    linkUrl: shareUrl,
    imageUrl: ogImageUrl,
  };

  const handleShare = (_channel: ShareChannel, _success: boolean) => {
    // Future: Add analytics tracking here
  };

  return (
    <ShareBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      config={config}
      onShare={handleShare}
    />
  );
}
