'use client';

import Image from 'next/image';
import { ReviewApi } from '@/app/api/ReviewApi';
import useModalStore from '@/store/modalStore';
import { AuthService } from '@/lib/AuthService';

interface Props {
  reviewId: string | number;
  isLiked: boolean;
  likeBtnName?: string;
  handleUpdateLiked: () => void;
  handleError: () => void;
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
  handleError,
  handleNotLogin,
  unLikeIconColor = 'gray',
  likeIconColor = 'subcoral',
  size = 14,
}: Props) => {
  const { isLogin } = AuthService;
  const { handleModalState } = useModalStore();

  const handleClick = async () => {
    if (!isLogin) {
      handleNotLogin();
    } else {
      handleUpdateLiked();
      try {
        await ReviewApi.putLike(reviewId, !isLiked);
      } catch (error) {
        handleModalState({
          isShowModal: true,
          type: 'ALERT',
          mainText: '좋아요 업데이트에 실패했습니다. 다시 시도해주세요.',
        });
        console.error('Error updating like status:', error);
        handleError();
      }
    }
  };

  return (
    <button
      className={
        likeBtnName
          ? 'flex items-center space-x-1'
          : 'justify-self-end row-start-3'
      }
      onClick={handleClick}
    >
      {isLiked ? (
        <Image
          src={`/icon/thumbup-filled-${likeIconColor}.svg`}
          width={size}
          height={size}
          alt="좋아요"
        />
      ) : (
        <Image
          src={`/icon/thumbup-outlined-${unLikeIconColor}.svg`}
          width={size}
          height={size}
          alt="좋아요"
        />
      )}
      {likeBtnName && (
        <p className="text-mainGray font-bold text-10">{likeBtnName}</p>
      )}
    </button>
  );
};

export default LikeBtn;
