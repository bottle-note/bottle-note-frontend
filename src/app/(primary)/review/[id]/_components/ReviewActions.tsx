import React from 'react';
import Image from 'next/image';
import ReviewLikeButton from '@/components/domain/review/ReviewLikeButton';
import useModalStore from '@/store/modalStore';
import { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';
import { useAuth } from '@/hooks/auth/useAuth';

interface ReviewActionsProps {
  data: ReviewDetailsWithoutAlcoholInfo;
  isLiked: boolean;
  likeCount: number;
  onLikeUpdate: () => void;
  onLikeError: () => void;
  handleLogin: () => void;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
}

export default function ReviewActions({
  data,
  isLiked,
  likeCount,
  onLikeUpdate,
  onLikeError,
  handleLogin,
  textareaRef,
}: ReviewActionsProps) {
  const { isLoggedIn } = useAuth();
  const { handleModalState } = useModalStore();

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
        <div className="text-mainGray text-10">{likeCount}개</div>
      </div>
      <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4" />
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
        <Image
          src={
            data.reviewInfo?.hasReplyByMe
              ? '/icon/comment-filled-subcoral.svg'
              : '/icon/comment-outlined-gray.svg'
          }
          width={16}
          height={16}
          alt="comment"
        />
        <p className="relative w-fit text-mainGray font-bold text-13">
          댓글 작성
        </p>
      </button>
      <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4" />
      <button
        className="flex-1 flex text-center justify-center items-center space-x-1"
        onClick={() => {
          handleModalState({
            isShowModal: true,
            mainText: '아직 준비 중인 기능입니다. 조금만 기다려주세요!',
          });
        }}
      >
        <Image
          src="/icon/externallink-outlined-gray.svg"
          alt="linkIcon"
          width={16}
          height={16}
        />
        <p className="text-mainGray font-bold text-13">공유</p>
      </button>
    </section>
  );
}
