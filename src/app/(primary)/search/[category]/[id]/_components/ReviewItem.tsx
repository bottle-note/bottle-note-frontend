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
import { AuthService } from '@/lib/AuthService';
import { ROUTES } from '@/constants/routes';

interface Props {
  data: ReviewType;
  onRefresh: () => void;
}

function ReviewItem({ data, onRefresh }: Props) {
  const router = useRouter();
  const { userData, isLogin } = AuthService;
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
        <div>
          <Link
            href={ROUTES.REVIEW.DETAIL(data.reviewId)}
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
            prefetch={false}
          >
            <div className="flex space-x-2">
              <div className="flex-1 min-w-0">
                <p className="text-mainDarkGray text-13.5">
                  {truncStr(data.reviewContent, 135)}
                  {data.reviewContent.length > 135 && (
                    <span className="text-mainGray">더보기</span>
                  )}
                </p>
              </div>
              {data.reviewImageUrl && (
                <div className="flex-shrink-0">
                  <Image
                    className="w-[68px] h-[68px] object-cover"
                    src={data.reviewImageUrl}
                    alt="content_img"
                    width={68}
                    height={68}
                  />
                </div>
              )}
            </div>
          </Link>
        </div>
        <ReviewActions
          reviewId={data.reviewId}
          isLiked={isLiked}
          likeCount={likeCount}
          replyCount={data.replyCount}
          hasReplyByMe={data.hasReplyByMe}
          createAt={data.createAt}
          isOwner={data.userInfo.userId === userData?.userId}
          showVisibilityToggle={true}
          visibilityStatus={currentStatus}
          onLikeUpdate={() => {
            setIsLiked((prev) => !prev);
            setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
          }}
          onLikeError={() => {
            setIsLiked(isLikedByMe);
            setLikeCount(data.likeCount);
          }}
          onRefresh={onRefresh}
          onOptionClick={() => {
            if (isLogin) setIsOptionShow(true);
            else handleLoginModal();
          }}
          handleNotLogin={handleLoginModal}
          textSize="text-13"
          iconSize={15.6}
        />
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
