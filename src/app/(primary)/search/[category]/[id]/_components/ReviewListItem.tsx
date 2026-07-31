'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { ReviewInDetails } from '@/api/alcohol/types';
import ReviewListUserInfo from '@/app/(primary)/search/[category]/[id]/_components/ReviewListUserInfo';
import { numberWithCommas } from '@/utils/formatNum';
import { truncStr } from '@/utils/truncStr';
import ReviewListActions from '@/app/(primary)/search/[category]/[id]/_components/ReviewListActions';
import useModalStore from '@/store/modalStore';
import useRelationshipsStore from '@/store/relationshipsStore';
import { useAuth } from '@/hooks/auth/useAuth';
import ReviewActionDropdown from '@/components/domain/review/ReviewActionDropdown';
import SemanticIcon from '@/components/ui/Display/SemanticIcon';
import { useBlockActions } from '@/hooks/useBlockActions';

interface Props {
  data: ReviewInDetails;
  onRefresh: () => void;
}

function ReviewListItem({ data, onRefresh }: Props) {
  const { id: alcoholId } = useParams();
  const { user: userData, isLoggedIn } = useAuth();
  const { isLikedByMe } = data;
  const { handleLoginModal } = useModalStore();
  const { isUserBlocked } = useRelationshipsStore();
  const { handleUnblockUser } = useBlockActions();

  const [isOptionShow, setIsOptionShow] = useState(false);
  const [isLiked, setIsLiked] = useState(isLikedByMe);
  const [currentStatus, setCurrentStatus] = useState(data.status === 'PUBLIC');
  const [likeCount, setLikeCount] = useState(data.likeCount);
  const priceIconSrc =
    data.sizeType === 'BOTTLE'
      ? '/bottle.svg'
      : '/icon/glass-filled-subcoral.svg';

  useEffect(() => {
    setCurrentStatus(data.status === 'PUBLIC');
  }, [data.status]);

  useEffect(() => {
    setLikeCount(data.likeCount);
  }, [data.likeCount]);

  return (
    <>
      <div className="space-y-[10px] border-b border-stroke-neutral-subtle py-[35px]">
        <ReviewListUserInfo
          userInfo={data.userInfo}
          rating={data.rating}
          isBestReview={data.isBestReview}
          isMyReview={data.isMyReview}
          userImageSize={22}
          userNameSize="text-12"
          starSize={22}
          starTextStyle="min-w-5 text-20 font-semibold text-fg-rating"
        />
        {isUserBlocked(String(data.userInfo.userId)) ? (
          <div className="flex items-center justify-between text-fg-neutral-muted">
            <div className="text-13">차단한 사용자의 리뷰입니다.</div>
            <button
              className="border-b border-stroke-neutral-weak text-13"
              onClick={() =>
                handleUnblockUser(
                  String(data.userInfo.userId),
                  data.userInfo.nickName,
                )
              }
            >
              차단해제
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-1 text-13">
              <SemanticIcon
                src={priceIconSrc}
                width={23}
                height={23}
                className="text-fg-brand"
              />
              <p className="font-bold text-fg-neutral-muted">
                {data.sizeType === 'BOTTLE' ? '병 가격 ' : '잔 가격'}
              </p>
              <p className="font-normal text-fg-neutral-muted">
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
                    <p className="break-words text-13.5 text-fg-neutral">
                      {truncStr(data.reviewContent, 135)}
                      {data.reviewContent.length > 135 && (
                        <span className="text-fg-neutral-muted">더보기</span>
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
            <ReviewListActions
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
                if (isLoggedIn) setIsOptionShow(true);
                else handleLoginModal();
              }}
              handleNotLogin={handleLoginModal}
              textSize="text-13"
              iconSize={15.6}
            />
          </>
        )}
      </div>
      <ReviewActionDropdown
        isShow={isOptionShow}
        onClose={() => setIsOptionShow(false)}
        isOwnReview={userData?.userId === data.userInfo.userId}
        reviewId={String(data.reviewId)}
        userId={String(data.userInfo.userId)}
        userNickname={data.userInfo.nickName}
        alcoholId={alcoholId as string}
        onRefresh={onRefresh}
      />
    </>
  );
}

export default ReviewListItem;
