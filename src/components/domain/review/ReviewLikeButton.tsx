'use client';

import Image from 'next/image';
import { ReviewApi } from '@/app/api/ReviewApi';
import { useAuth } from '@/hooks/auth/useAuth';
import { useDebouncedToggle } from '@/hooks/useDebouncedToggle';

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
  const { isLoggedIn } = useAuth();

  const { handleToggle } = useDebouncedToggle({
    isToggled: isLiked,
    apiCall: ReviewApi.putLike,
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
    handleToggle(newLikeState);
  };

  const iconType = isLiked ? 'filled' : 'outlined';
  const iconColor = isLiked ? likeIconColor : unLikeIconColor;
  const iconSrc = `/icon/thumbup-${iconType}-${iconColor}.svg`;

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
      <Image
        src={iconSrc}
        width={size}
        height={size}
        alt="좋아요"
        style={{ display: 'block' }}
      />
      {likeBtnName && (
        <span
          className="text-mainGray font-bold text-13"
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
