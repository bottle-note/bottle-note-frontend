'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Review as ReviewType } from '@/types/Review';
import ReviewUserInfo from '@/app/(primary)/search/[category]/[id]/_components/ReviewUserInfo';
import { numberWithCommas } from '@/utils/formatNum';
import { truncStr } from '@/utils/truncStr';
import ReviewActions from '@/app/(primary)/search/[category]/[id]/_components/ReviewActions';
import OptionDropdown from '@/components/OptionDropdown';
import useModalStore from '@/store/modalStore';
import { deleteReview } from '@/lib/Review';
import { useAuth } from '@/hooks/auth/useAuth';
import { ROUTES } from '@/constants/routes';

interface Props {
  data: ReviewType;
  onRefresh: () => void;
}

function ReviewItem({ data, onRefresh }: Props) {
  const router = useRouter();
  const { user: userData, isLoggedIn } = useAuth();
  const { isLikedByMe } = data;
  const { handleModalState, handleLoginModal } = useModalStore();

  const [isOptionShow, setIsOptionShow] = useState(false);
  const [isLiked, setIsLiked] = useState(isLikedByMe);
  const [currentStatus, setCurrentStatus] = useState(data.status === 'PUBLIC');
  const [likeCount, setLikeCount] = useState(data.likeCount);

  const handleCloseOption = () => {
    handleModalState({
      isShowModal: true,
      type: 'ALERT',
      mainText: '성공적으로 삭제되었습니다.',
      handleConfirm: () => {
        setIsOptionShow(false);
        handleModalState({
          isShowModal: false,
          mainText: '',
        });
        // refresh review list
      },
    });
  };

  const handleOptionSelect = (option: { name: string; type: string }) => {
    if (option.type === 'DELETE') {
      handleModalState({
        isShowModal: true,
        mainText: '정말 삭제하시겠습니까?',
        type: 'CONFIRM',
        handleConfirm: () => {
          deleteReview(data.reviewId, handleCloseOption);
        },
      });
    } else if (option.type === 'MODIFY') {
      router.push(ROUTES.REVIEW.MODIFY(data.reviewId));
    } else if (option.type === 'REVIEW_REPORT') {
      router.push(ROUTES.REPORT.REVIEW(data.reviewId));
    } else if (option.type === 'USER_REPORT') {
      router.push(ROUTES.REPORT.USER(data.userInfo.userId));
    }
  };

  useEffect(() => {
    setCurrentStatus(data.status === 'PUBLIC');
  }, [data.status]);

  useEffect(() => {
    setLikeCount(data.likeCount);
  }, [data.likeCount]);

  return (
    <>
      <div className="border-b border-mainGray/30 py-[35px] space-y-[10px]">
        <ReviewUserInfo
          userInfo={data.userInfo}
          rating={data.rating}
          isBestReview={data.isBestReview}
          isMyReview={data.isMyReview}
          userImageSize={22}
          userNameSize="text-12"
          starSize={22}
          starTextStyle="text-subCoral font-semibold text-20 min-w-5"
        />
        <div className="flex items-center space-x-1 text-13">
          <Image
            src={
              data.sizeType === 'BOTTLE'
                ? '/bottle.svg'
                : '/icon/glass-filled-subcoral.svg'
            }
            width={23}
            height={23}
            alt={data.sizeType === 'BOTTLE' ? 'Bottle Price' : 'Glass Price'}
          />
          <p className="text-mainGray font-bold">
            {data.sizeType === 'BOTTLE' ? '병 가격 ' : '잔 가격'}
          </p>
          <p className="text-mainGray font-normal">
            {data.price ? `${numberWithCommas(data.price)}₩` : '-'}
          </p>
        </div>
        <Link
          href={ROUTES.REVIEW.DETAIL(data.reviewId)}
          style={{
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
          prefetch={false}
        >
          <div className="grid grid-cols-5 space-x-2 mt-[6px]">
            <p className="col-span-4 text-mainDarkGray text-13">
              {truncStr(data.reviewContent, 135)}
              {data.reviewContent.length > 135 && (
                <span className="text-mainGray">더보기</span>
              )}
            </p>
            {data.reviewImageUrl && (
              <div className="flex justify-end items-center">
                <Image
                  className="w-[3.8rem] h-[3.8rem]"
                  src={data.reviewImageUrl}
                  alt="content_img"
                  width={60}
                  height={60}
                />
              </div>
            )}
          </div>
        </Link>
        <div className="flex justify-between text-12 text-mainGray mt-[10px]">
          <div className="flex space-x-3">
            <div className="flex items-center space-x-[2px]">
              <LikeBtn
                reviewId={data.reviewId}
                isLiked={isLiked}
                handleUpdateLiked={() => {
                  setIsLiked((prev) => !prev);
                  setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
                }}
                onApiError={() => {
                  setIsLiked(isLikedByMe);
                  setLikeCount(data.likeCount);
                }}
                handleNotLogin={handleLoginModal}
                size={15}
              />
              <p>{likeCount}</p>
            </div>
            <ReplyButton
              reviewId={data.reviewId}
              replyCount={data.replyCount}
              hasReplyByMe={data.hasReplyByMe}
              size={15}
              textSize="text-12"
            />
            {data.userInfo.userId === userData?.userId && (
              <VisibilityToggle
                initialStatus={currentStatus}
                reviewId={data.reviewId}
                handleNotLogin={handleLoginModal}
                onSuccess={onRefresh}
                textSize="text-12"
              />
            )}
          </div>
          <div className="flex items-center">
            <p className="text-12">{formatDate(data.createAt) as string}</p>
            <button
              className="cursor-pointer"
              onClick={() => {
                if (isLoggedIn) setIsOptionShow(true);
                else handleLoginModal();
              }}
            >
              <Image
                src="/icon/ellipsis-darkgray.svg"
                width={14}
                height={14}
                alt="report"
              />
            </button>
          </div>
        </div>
      </div>
      {isOptionShow && (
        <OptionDropdown
          handleClose={() => setIsOptionShow(false)}
          options={
            userData?.userId === data.userInfo.userId
              ? [
                  { name: '수정하기', type: 'MODIFY' },
                  { name: '삭제하기', type: 'DELETE' },
                ]
              : [
                  { name: '리뷰 신고', type: 'REVIEW_REPORT' },
                  { name: '유저 신고', type: 'USER_REPORT' },
                ]
          }
          handleOptionSelect={handleOptionSelect}
          title={
            userData?.userId === data.userInfo.userId ? '내 리뷰' : '신고하기'
          }
        />
      )}
    </>
  );
}

export default ReviewItem;
