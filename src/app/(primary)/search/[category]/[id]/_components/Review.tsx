'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import userImg from 'public/user_img.png';
import { Review as ReviewType } from '@/types/Review';
import Label from '@/app/(primary)/_components/Label';
import { truncStr } from '@/utils/truncStr';
import Star from '@/components/Star';
import { numberWithCommas } from '@/utils/formatNum';
import { formatDate } from '@/utils/formatDate';
import Toggle from '@/app/(primary)/_components/Toggle';
import OptionModal from '@/app/(primary)/_components/OptionModal';

interface Props {
  isBest?: boolean;
  isMine?: boolean;
  data: ReviewType;
}

function Review({ data, isBest = false, isMine = false }: Props) {
  const {
    reviewId,
    userId,
    imageUrl,
    nickName,
    rating,
    sizeType,
    price,
    reviewContent,
    reviewImageUrl,
    isMyLike,
    likeCount,
    isMyReply,
    replyCount,
    createAt,
    status,
  } = data;

  const [isOptionShow, setIsOptionShow] = useState(false);
  const handleOptionsShow = () => {
    setIsOptionShow((prev) => !prev);
  };
  return (
    <>
      <div className="space-y-2 border-b border-mainGray/30 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Link href={`/user/${userId}`}>
              <div className="flex items-center space-x-1">
                <div className="w-7 h-7 rounded-full overflow-hidden">
                  <Image
                    className="object-cover"
                    src={imageUrl || userImg}
                    alt="user_img"
                    width={28}
                    height={28}
                  />
                </div>
                <p className="text-mainGray text-9">{truncStr(nickName, 12)}</p>
              </div>
            </Link>
            {isBest && (
              <Label
                name="베스트"
                icon="/icon/thumbup-filled-white.svg"
                style="bg-mainCoral text-white px-2 py-[0.1rem] text-9 border-mainCoral rounded"
              />
            )}
            {isMine && (
              <Label
                name="나의 코멘트"
                icon="/icon/user-outlined-subcoral.svg"
                iconHeight={10}
                style="border-mainCoral text-mainCoral px-2 py-[0.1rem] text-9 rounded"
              />
            )}
          </div>
          <Star rating={rating} size={20} />
        </div>
        <div className="flex items-center space-x-1">
          <Image
            src={
              sizeType === 'bottle'
                ? '/bottle.svg'
                : '/icon/glass-filled-subcoral.svg'
            }
            width={12}
            height={12}
            alt={sizeType === 'bottle' ? 'Bottle Price' : 'Glass Price'}
          />
          <p className="text-mainGray text-10 font-semibold">
            {sizeType === 'bottle' ? '병 가격 ' : '잔 가격'}
          </p>
          <p className="text-mainGray text-10 font-light">
            {numberWithCommas(price)}₩
          </p>
        </div>
        <div className="grid grid-cols-5 space-x-2" onClick={() => {}}>
          <p className="col-span-4 text-mainDarkGray text-10">
            {/* 클릭 범위 고민 필요 */}
            <Link href={`/review/${reviewId}`}>
              {truncStr(reviewContent, 135)}
              {reviewContent.length > 135 && (
                <span className="text-mainGray">더보기</span>
              )}
            </Link>
          </p>
          <div className="flex justify-end items-center">
            <Image
              className="w-[3.8rem] h-[3.8rem]"
              src={reviewImageUrl || userImg}
              alt="content_img"
              width={60}
              height={60}
            />
          </div>
        </div>
        <div className="flex justify-between text-9 text-mainGray">
          <div className="flex space-x-3">
            <div className="flex items-center space-x-1">
              <Image
                src={
                  isMyLike
                    ? '/icon/thumbup-filled-subcoral.svg'
                    : '/icon/thumbup-outlined-gray.svg'
                }
                width={10}
                height={10}
                alt="like"
              />
              <p>{likeCount}</p>
            </div>
            <div className="flex items-center space-x-1">
              <Image
                src={
                  isMyReply
                    ? '/icon/comment-filled-subcoral.svg'
                    : '/icon/comment-outlined-gray.svg'
                }
                width={10}
                height={10}
                alt="comment"
              />
              <p>{replyCount}</p>
            </div>
            {userId && ( // 로그인 구현 후 user 확인 후 표시하는 코드 추가
              <Toggle
                defaultState={status === 'PUBLIC'}
                offValue="리뷰 비공개"
                onValue="리뷰 공개"
                onChange={() => {}}
              />
            )}
          </div>
          <div className="flex">
            <p className="text-9">{formatDate(createAt)}</p>
            <button
              className="cursor-pointer"
              onClick={() => {
                setIsOptionShow(true);
              }}
            >
              <Image
                src={'/icon/ellipsis-darkgray.svg'}
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
          options={[
            { name: '리뷰 신고', path: '' },
            { name: '유저 신고', path: '' },
          ]}
          handleClose={handleOptionsShow}
        />
      )}
    </>
  );
}

export default Review;
