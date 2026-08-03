'use client';

import { ThumbsUp } from 'lucide-react';
import { ReviewApi } from '@/api/review/review.api';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useDebouncedToggle } from '@/hooks/useDebouncedToggle';
import { trackGA4Event } from '@/utils/analytics/ga4';

interface Props {
  reviewId: string | number;
  isLiked: boolean;
  likeBtnName?: string;
  handleUpdateLiked: () => void;
  onApiSuccess?: () => void;
  onApiError?: () => void;
  handleNotLogin: () => void;
  likeIconColor?: 'white' | 'subcoral';
  unLikeIconColor?: 'gray' | 'subcoral';
  size?: number;
}

const ReviewLikeButton = ({
  reviewId,
  isLiked,
  likeBtnName,
  handleUpdateLiked,
  onApiSuccess,
  onApiError,
  handleNotLogin,
  unLikeIconColor = 'gray',
  likeIconColor = 'subcoral',
  size = 18,
}: Props) => {
  const { isLoggedIn } = useAuthSession();

  const { handleToggle } = useDebouncedToggle({
    isToggled: isLiked,
    apiCall: async ({ id, state }) => {
      await ReviewApi.putLike({ reviewId: String(id), isLiked: state });
    },
    id: reviewId,
    onApiSuccess,
    onApiError,
    errorMessage: '좋아요 업데이트에 실패했습니다. 다시 시도해주세요.',
  });

  const handleClick = async () => {
    if (!isLoggedIn) {
      handleNotLogin();
      return;
    }

    handleUpdateLiked();
    const newLikeState = !isLiked;
    trackGA4Event('like_review', {
      review_id: String(reviewId),
      action: newLikeState ? 'like' : 'unlike',
    });
    handleToggle(newLikeState);
  };

  let iconClass = 'text-fg-neutral-muted';

  if (isLiked) {
    iconClass =
      likeIconColor === 'white'
        ? 'fill-current text-palette-static-white'
        : 'fill-current text-fg-brand';
  } else if (unLikeIconColor === 'subcoral') {
    iconClass = 'text-fg-brand';
  }

  return (
    <button
      className={
        likeBtnName
          ? 'inline-flex justify-center'
          : 'justify-self-end row-start-3'
      }
      onClick={handleClick}
      style={{ alignItems: 'center' }}
    >
      <ThumbsUp
        aria-label="좋아요"
        className={iconClass}
        width={size}
        height={size}
      />
      {likeBtnName && (
        <span
          className="text-13 font-bold text-fg-neutral-muted"
          style={{
            marginLeft: '4px',
          }}
        >
          {likeBtnName}
        </span>
      )}
    </button>
  );
};

export default ReviewLikeButton;
