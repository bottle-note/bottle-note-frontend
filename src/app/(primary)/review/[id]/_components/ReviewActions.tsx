import React from 'react';
import Image from 'next/image';
import LikeBtn from '@/app/(primary)/_components/LikeBtn';
import useModalStore from '@/store/modalStore';
import { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';
import { AuthService } from '@/lib/AuthService';

interface ReviewActionsProps {
  data: ReviewDetailsWithoutAlcoholInfo;
  isLiked: boolean;
  likeCount: number;
  onLikeUpdate: () => void;
  onLikeError: () => void;
  handleLogin: () => void;
}

export default function ReviewActions({
  data,
  isLiked,
  likeCount,
  onLikeUpdate,
  onLikeError,
  handleLogin,
}: ReviewActionsProps) {
  const { isLogin } = AuthService;
  const { handleModalState } = useModalStore();

  return (
    <section className="mx-5 py-5 flex items-center">
      <div className="flex-1 flex justify-center items-center space-x-1">
        <LikeBtn
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
      <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4 mx-1" />
      <div className="flex-1 flex justify-center items-center">
        <button
          className="flex items-center space-x-1"
          onClick={() => {
            if (!isLogin) handleLogin();
          }}
        >
          <Image
            src={
              data.reviewInfo?.hasReplyByMe
                ? 'icon/comment-filled-subcoral.svg'
                : '/icon/comment-outlined-gray.svg'
            }
            width={19}
            height={19}
            alt="comment"
          />
          <p className="text-mainGray font-bold text-13">댓글 작성</p>
        </button>
      </div>
      <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4 mx-1" />
      <div className="flex-1 flex justify-center items-center">
        <button
          className="flex items-center space-x-1"
          onClick={() => {
            handleModalState({
              isShowModal: true,
              type: 'ALERT',
              mainText: '아직 준비 중인 기능입니다. 조금만 기다려주세요!',
            });
          }}
        >
          <Image
            src="/icon/externallink-outlined-gray.svg"
            alt="linkIcon"
            width={19}
            height={19}
          />
          <p className="text-mainGray font-bold text-13">공유</p>
        </button>
      </div>
    </section>
  );
}
