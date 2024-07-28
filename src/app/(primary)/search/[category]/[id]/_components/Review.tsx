'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Review as ReviewType } from '@/types/Review';
import Label from '@/app/(primary)/_components/Label';
import { truncStr } from '@/utils/truncStr';
import Star from '@/components/Star';
import { numberWithCommas } from '@/utils/formatNum';
import { formatDate } from '@/utils/formatDate';
import Toggle from '@/app/(primary)/_components/Toggle';
import OptionModal from '@/app/(primary)/_components/OptionModal';
import { ReviewApi } from '@/app/api/ReviewApi';
import LikeBtn from '@/app/(primary)/_components/LikeBtn';
import userImg from 'public/user_img.png';

interface Props {
  data: ReviewType;
  handleLogin: () => void;
}

function Review({ data, handleLogin }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isLikedByMe } = data;
  const [isOptionShow, setIsOptionShow] = useState(false);
  const [isLiked, setIsLiked] = useState(isLikedByMe);

  const handleOptionsShow = () => {
    setIsOptionShow((prev) => !prev);
  };

  const deleteReview = async () => {
    if (!data.reviewId) return;
    try {
      const result = await ReviewApi.deleteReview(data.reviewId.toString());
      if (result) {
        alert('성공적으로 삭제되었습니다.');
        router.back();
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  return (
    <>
      <div className="space-y-2 border-b border-mainGray/30 pb-3 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Link href={`/user/${data.userId}`}>
              <div className="flex items-center space-x-1">
                <div className="w-7 h-7 rounded-full overflow-hidden">
                  <Image
                    className="object-cover"
                    src={data.userProfileImage || userImg}
                    alt="user_img"
                    width={28}
                    height={28}
                  />
                </div>
                <p className="text-mainGray text-9">
                  {truncStr(data.nickName, 12)}
                </p>
              </div>
            </Link>
            {/* {isBest && (
              <Label
                name="베스트"
                icon="/icon/thumbup-filled-white.svg"
                style="bg-mainCoral text-white px-2 py-[0.1rem] text-9 border-mainCoral rounded"
              />
            )} */}
            {data.isMyReview && (
              <Label
                name="나의 코멘트"
                icon="/icon/user-outlined-subcoral.svg"
                iconHeight={10}
                style="border-mainCoral text-mainCoral px-2 py-[0.1rem] text-9 rounded"
              />
            )}
          </div>
          <Star rating={data.rating} size={20} />
        </div>
        <div className="flex items-center space-x-1">
          <Image
            src={
              data.sizeType === 'BOTTLE'
                ? '/bottle.svg'
                : '/icon/glass-filled-subcoral.svg'
            }
            width={12}
            height={12}
            alt={data.sizeType === 'BOTTLE' ? 'Bottle Price' : 'Glass Price'}
          />
          <p className="text-mainGray text-10 font-semibold">
            {data.sizeType === 'BOTTLE' ? '병 가격 ' : '잔 가격'}
          </p>
          <p className="text-mainGray text-10 font-light">
            {data.price ? `${numberWithCommas(data.price)} ₩` : '-'}
          </p>
        </div>
        <div className="grid grid-cols-5 space-x-2">
          <p className="col-span-4 text-mainDarkGray text-10">
            <Link href={`/review/${data.reviewId}`}>
              {truncStr(data.reviewContent, 135)}
              {data.reviewContent.length > 135 && (
                <span className="text-mainGray">더보기</span>
              )}
            </Link>
          </p>
          <div className="flex justify-end items-center">
            <Image
              className="w-[3.8rem] h-[3.8rem]"
              src={data.reviewImageUrl || userImg}
              alt="content_img"
              width={60}
              height={60}
            />
          </div>
        </div>
        <div className="flex justify-between text-9 text-mainGray">
          <div className="flex space-x-3">
            {/* API 연결 필요 */}
            <div className="flex items-center space-x-1">
              <LikeBtn
                reviewId={data.reviewId}
                isLiked={isLiked}
                handleUpdateLiked={() => setIsLiked((prev) => !prev)}
                handleError={() => {
                  setIsLiked(isLikedByMe);
                }}
                handleNotLogin={handleLogin}
                size={10}
              />
              <p>{data.likeCount}</p>
            </div>
            <div className="flex items-center space-x-1">
              <Image
                src={
                  data.hasReplyByMe
                    ? '/icon/comment-filled-subcoral.svg'
                    : '/icon/comment-outlined-gray.svg'
                }
                width={10}
                height={10}
                alt="comment"
              />
              <p>{data.replyCount}</p>
            </div>
            {data.userId && ( // API 완성되면 컴포넌트 만들고 연동하기
              <Toggle
                defaultState={data.status === 'PUBLIC'}
                offValue="리뷰 비공개"
                onValue="리뷰 공개"
                onChange={() => {}}
              />
            )}
          </div>
          <div className="flex">
            <p className="text-9">{formatDate(data.createAt)}</p>
            <button
              className="cursor-pointer"
              onClick={() => {
                setIsOptionShow(true);
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
        <OptionModal
          options={
            session?.user?.userId === data.userId
              ? [
                  {
                    name: '수정하기',
                    path: `/review/modify?reviewId=${data.reviewId}`,
                  },
                  {
                    name: '삭제하기',
                    action: () => {
                      const result = confirm('정말 삭제하시겠습니까?');
                      if (result) deleteReview();
                    },
                  },
                ]
              : [
                  { name: '리뷰 신고', path: '' },
                  { name: '유저 신고', path: '' },
                ]
          }
          type={session?.user?.userId === data.userId ? '리뷰' : '신고하기'}
          handleClose={handleOptionsShow}
        />
      )}
    </>
  );
}

export default Review;
