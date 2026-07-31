import React from 'react';
import ReviewLikeButton from '@/components/domain/review/ReviewLikeButton';
import ReplyButton from '@/components/domain/review/ReplyButton';
import VisibilityToggle from '@/components/ui/Form/VisibilityToggle';
import SemanticIcon from '@/components/ui/Display/SemanticIcon';
import { formatDate } from '@/utils/formatDate';

interface ReviewFooterProps {
  reviewId: number;
  isLiked: boolean;
  likeCount: number;
  replyCount: number;
  hasReplyByMe: boolean;
  createAt: string;
  isOwner?: boolean;
  showVisibilityToggle?: boolean;
  visibilityStatus?: boolean;
  onLikeUpdate: () => void;
  onLikeError: () => void;
  onRefresh?: () => void;
  onOptionClick: () => void;
  handleNotLogin: () => void;
  textSize?: string;
  iconSize?: number;
  className?: string;
}

export default function ReviewListActions({
  reviewId,
  isLiked,
  likeCount,
  replyCount,
  hasReplyByMe,
  createAt,
  isOwner = false,
  showVisibilityToggle = false,
  visibilityStatus = true,
  onLikeUpdate,
  onLikeError,
  onRefresh,
  onOptionClick,
  handleNotLogin,
  textSize = 'text-13',
  iconSize = 15.6,
  className = '',
}: ReviewFooterProps) {
  return (
    <div
      className={`flex justify-between ${textSize} text-fg-neutral-muted ${className}`}
    >
      <div className="flex space-x-4">
        <div className="flex items-center space-x-[2px]">
          <ReviewLikeButton
            reviewId={reviewId}
            isLiked={isLiked}
            handleUpdateLiked={onLikeUpdate}
            onApiError={onLikeError}
            handleNotLogin={handleNotLogin}
            size={iconSize}
          />
          <p>{likeCount}</p>
        </div>
        <ReplyButton
          reviewId={reviewId}
          replyCount={replyCount}
          hasReplyByMe={hasReplyByMe}
          size={iconSize}
          textSize={textSize}
        />
        {isOwner && showVisibilityToggle && (
          <VisibilityToggle
            initialStatus={visibilityStatus}
            reviewId={reviewId}
            handleNotLogin={handleNotLogin}
            onSuccess={onRefresh ?? (() => {})}
            textSize={textSize}
          />
        )}
      </div>
      <div className="flex items-center">
        <p className="text-12">{formatDate(createAt) as string}</p>
        <button
          className="cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
          onClick={onOptionClick}
          aria-label="리뷰 메뉴"
        >
          <SemanticIcon
            src="/icon/ellipsis-darkgray.svg"
            width={16.8}
            height={16.8}
          />
        </button>
      </div>
    </div>
  );
}
