'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { ReviewApi } from '@/app/api/ReviewApi';
import useModalStore from '@/store/modalStore';
import { AuthService } from '@/lib/AuthService';
import useDebounceAction from '@/hooks/useDebounceAction';
import { DEBOUNCE_DELAY } from '@/constants/common';

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

const LikeBtn = ({
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
  const { isLogin } = AuthService;
  const { handleModalState } = useModalStore();
  const { debounce } = useDebounceAction(DEBOUNCE_DELAY);

  const lastSyncedStateRef = useRef(isLiked);
  const pendingStateRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (pendingStateRef.current === null) {
      lastSyncedStateRef.current = isLiked;
    }
  }, [isLiked]);

  const handleClick = async () => {
    if (!isLogin) {
      handleNotLogin();
      return;
    }

    handleUpdateLiked();

    const newLikeState = !isLiked;
    pendingStateRef.current = newLikeState;

    debounce(async () => {
      const stateToSync = pendingStateRef.current;

      if (stateToSync === null || stateToSync === lastSyncedStateRef.current) {
        return;
      }

      try {
        await ReviewApi.putLike(reviewId, stateToSync);
        lastSyncedStateRef.current = stateToSync;
        pendingStateRef.current = null;

        if (onApiSuccess) {
          onApiSuccess();
        }
      } catch (error) {
        console.error('Error updating like status:', error);
        pendingStateRef.current = null;

        handleModalState({
          isShowModal: true,
          type: 'ALERT',
          mainText: '좋아요 업데이트에 실패했습니다. 다시 시도해주세요.',
        });

        if (onApiError) {
          onApiError();
        }
      }
    });
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

export default LikeBtn;
