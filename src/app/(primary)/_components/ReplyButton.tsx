import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
      <Image
        src={
          hasReplyByMe
            ? '/icon/comment-filled-subcoral.svg'
            : '/icon/comment-outlined-gray.svg'
        }
        width={size}
        height={size}
        alt="comment"
      />
      <p className={`text-mainGray ${textSize}`}>{replyCount}</p>
    </div>
  );
}
