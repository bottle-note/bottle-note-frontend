import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface ReplyButtonProps {
  reviewId: number;
  replyCount: number;
  hasReplyByMe: boolean;
  size?: number;
  textSize?: string;
  className?: string;
}

export default function ReplyButton({
  reviewId,
  replyCount,
  hasReplyByMe,
  size = 12,
  textSize = 'text-13',
  className = '',
}: ReplyButtonProps) {
  const router = useRouter();

  const moveToReviewDetail = () => {
    router.push(ROUTES.REVIEW.DETAIL(reviewId) + `?scrollTo=replies`);
  };

  return (
    <div
      className={`flex items-center space-x-[2px] cursor-pointer ${className}`}
      onClick={moveToReviewDetail}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          moveToReviewDetail();
        }
      }}
    >
      <MessageCircle
        aria-hidden
        className={
          hasReplyByMe ? 'fill-current text-fg-brand' : 'text-fg-neutral-muted'
        }
        width={size}
        height={size}
      />
      <p className={`text-fg-neutral-muted ${textSize}`}>{replyCount}</p>
    </div>
  );
}
