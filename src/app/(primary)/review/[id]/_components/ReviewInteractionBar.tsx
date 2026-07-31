import { useState, useMemo, type MutableRefObject } from 'react';
import { ExternalLink, MessageCircle } from 'lucide-react';
import ReviewLikeButton from '@/components/domain/review/ReviewLikeButton';
import ShareDropdown from '@/components/share/ShareDropdown';
import { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';
import { useAuth } from '@/hooks/auth/useAuth';
import type { ShareConfig } from '@/types/share';

interface ReviewInteractionBarProps {
  data: ReviewDetailsWithoutAlcoholInfo;
  isLiked: boolean;
  likeCount: number;
  onLikeUpdate: () => void;
  onLikeError: () => void;
  handleLogin: () => void;
  textareaRef?: MutableRefObject<HTMLTextAreaElement | null>;
}

export default function ReviewInteractionBar({
  data,
  isLiked,
  likeCount,
  onLikeUpdate,
  onLikeError,
  handleLogin,
  textareaRef,
}: ReviewInteractionBarProps) {
  const { isLoggedIn } = useAuth();
  const [isShareOpen, setIsShareOpen] = useState(false);

  // ShareConfig 생성
  const shareConfig: ShareConfig = useMemo(() => {
    const reviewContent = data.reviewInfo?.reviewContent || '';
    const reviewId = data.reviewInfo?.reviewId?.toString() || '';
    const userName = data.reviewInfo?.userInfo?.nickName || '사용자';

    // 리뷰 내용 일부를 설명으로 사용 (최대 100자)
    const description =
      reviewContent.length > 100
        ? `${reviewContent.slice(0, 100)}...`
        : reviewContent;

    // 현재 페이지 URL 생성
    const linkUrl =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://bottle-note.com/review/${reviewId}`;

    return {
      type: 'review',
      contentId: reviewId,
      title: `${userName}님의 리뷰`,
      description: description || '위스키 리뷰를 확인해보세요!',
      imageUrl: data.reviewImageList?.[0]?.viewUrl || '/images/og-image.png',
      linkUrl,
      buttonTitle: '리뷰 보기',
    };
  }, [data]);

  // 공유 Analytics 콜백 (추후 확장 가능)
  const handleShare = () => {
    // TODO: 추후 Analytics 연동
    // trackShareEvent({
    //   contentType: 'review',
    //   contentId: shareConfig.contentId,
    //   channel: _channel,
    //   platform: detectPlatform(),
    //   success: _success,
    // });
  };

  return (
    <section className="mx-5 py-5 flex items-center">
      <div className="flex-1 flex justify-center items-center space-x-1">
        <ReviewLikeButton
          size={19}
          reviewId={data?.reviewInfo?.reviewId}
          isLiked={isLiked}
          handleUpdateLiked={onLikeUpdate}
          onApiError={onLikeError}
          handleNotLogin={handleLogin}
          likeBtnName="좋아요"
        />
        <div className="text-10 text-fg-neutral-subtle">{likeCount}개</div>
      </div>
      <span className="h-4 w-px border-[0.01rem] border-stroke-neutral-subtle" />
      <button
        className="flex-1 flex text-center justify-center items-center space-x-1"
        onClick={() => {
          if (!isLoggedIn) {
            handleLogin();
          } else if (textareaRef?.current) {
            textareaRef.current.focus();
          }
        }}
      >
        <MessageCircle
          aria-hidden
          className={`h-4 w-4 ${
            data.reviewInfo?.hasReplyByMe
              ? 'fill-current text-fg-brand'
              : 'text-fg-neutral-muted'
          }`}
        />
        <p className="relative w-fit text-13 font-bold text-fg-neutral-muted">
          댓글 작성
        </p>
      </button>
      <span className="h-4 w-px border-[0.01rem] border-stroke-neutral-subtle" />
      <button
        className="flex-1 flex text-center justify-center items-center space-x-1"
        onClick={() => setIsShareOpen(true)}
      >
        <ExternalLink aria-hidden className="h-4 w-4 text-fg-neutral-muted" />
        <p className="text-13 font-bold text-fg-neutral-muted">공유</p>
      </button>

      <ShareDropdown
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        config={shareConfig}
        onShare={handleShare}
      />
    </section>
  );
}
