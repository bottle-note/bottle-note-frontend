'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Review as ReviewType } from '@/types/Review';
import Label from '@/app/(primary)/_components/Label';
import { truncStr } from '@/utils/truncStr';
import Star from '@/components/Star';
import { numberWithCommas } from '@/utils/formatNum';
import { formatDate } from '@/utils/formatDate';
import VisibilityToggle from '@/app/(primary)/_components/VisibilityToggle';
import LikeBtn from '@/app/(primary)/_components/LikeBtn';
import OptionDropdown from '@/components/OptionDropdown';
import useModalStore from '@/store/modalStore';
import { deleteReview } from '@/lib/Review';
import { AuthService } from '@/lib/AuthService';
import { ROUTES } from '@/constants/routes';

const DEFAULT_USER_IMAGE = '/profile-default.svg';

interface Props {
  data: ReviewType;
  onRefresh: () => void;
}

function Review({ data, onRefresh }: Props) {
  const router = useRouter();
  const { userData, isLogin } = AuthService;
  const { isLikedByMe } = data;
  const { handleModalState, handleLoginModal } = useModalStore();
  const [isOptionShow, setIsOptionShow] = useState(false);
  const [isLiked, setIsLiked] = useState(isLikedByMe);
  const [currentStatus, setCurrentStatus] = useState(data.status === 'PUBLIC');

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

  return (
    <>
      <div className="border-b border-mainGray/30 py-[15px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center  space-x-2">
            <Link href={ROUTES.USER.BASE(data.userInfo.userId)}>
              <div className="flex items-center space-x-1">
                <div className="w-[22px] h-[22px] rounded-full overflow-hidden">
                  <Image
                    className="object-cover"
                    src={data.userInfo.userProfileImage || DEFAULT_USER_IMAGE}
                    alt="user_img"
                    width={22}
                    height={22}
                  />
                </div>
                <p className="text-mainGray text-11">
                  {truncStr(data.userInfo.nickName, 12)}
                </p>
              </div>
            </Link>
            <div className="flex items-center space-x-1">
              {data.isBestReview && (
                <Label
                  name="베스트"
                  icon="/icon/thumbup-filled-white.svg"
                  styleClass="bg-mainCoral text-white px-2 py-[0.1rem] text-10 border-mainCoral rounded"
                />
              )}
              {data.isMyReview && (
                <Label
                  name="나의 코멘트"
                  icon="/icon/user-outlined-subcoral.svg"
                  iconHeight={10}
                  styleClass="border-mainCoral text-mainCoral px-2 py-[0.1rem] text-10 rounded"
                />
              )}
            </div>
          </div>
          {data.rating !== undefined && data.rating !== null && (
            <Star rating={data.rating} size={20} />
          )}
        </div>
        <div className="flex items-center space-x-1 mt-[10px]">
          <Image
            src={
              data.sizeType === 'BOTTLE'
                ? '/bottle.svg'
                : '/icon/glass-filled-subcoral.svg'
            }
            width={14}
            height={14}
            alt={data.sizeType === 'BOTTLE' ? 'Bottle Price' : 'Glass Price'}
          />
          <p className="text-mainGray text-12 font-bold">
            {data.sizeType === 'BOTTLE' ? '병 가격 ' : '잔 가격'}
          </p>
          <p className="text-mainGray text-12 font-normal">
            {data.price ? `${numberWithCommas(data.price)} ₩` : '-'}
          </p>
        </div>
        <Link href={ROUTES.REVIEW.DETAIL(data.reviewId)}>
          <div className="grid grid-cols-5 space-x-2 mt-[6px]">
            <p className="col-span-4 text-mainDarkGray text-12">
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
        <div className="flex justify-between text-11 text-mainGray mt-[10px]">
          <div className="flex space-x-3">
            <div className="flex items-center space-x-[2px]">
              <LikeBtn
                reviewId={data.reviewId}
                isLiked={isLiked}
                handleUpdateLiked={() => {
                  setIsLiked((prev) => !prev);
                  onRefresh();
                }}
                handleError={() => {
                  setIsLiked(isLikedByMe);
                }}
                handleNotLogin={handleLoginModal}
                size={12}
              />
              <p>{data.likeCount}</p>
            </div>
            <div className="flex items-center space-x-[2px]">
              <Image
                src={
                  data.hasReplyByMe
                    ? '/icon/comment-filled-subcoral.svg'
                    : '/icon/comment-outlined-gray.svg'
                }
                width={12}
                height={12}
                alt="comment"
              />
              <p>{data.replyCount}</p>
            </div>
            {data.userInfo.userId === userData?.userId && (
              <VisibilityToggle
                initialStatus={currentStatus}
                reviewId={data.reviewId}
                handleNotLogin={handleLoginModal}
                onSuccess={onRefresh}
              />
            )}
          </div>
          <div className="flex items-center">
            <p className="text-11">{formatDate(data.createAt) as string}</p>
            <button
              className="cursor-pointer"
              onClick={() => {
                if (isLogin) setIsOptionShow(true);
                else handleLoginModal();
              }}
            >
              <Image
                src="/icon/ellipsis-darkgray.svg"
                width={10}
                height={10}
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

export default Review;
