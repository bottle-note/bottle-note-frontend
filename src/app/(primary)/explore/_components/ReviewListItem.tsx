import { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import { Ellipsis, ThumbsUp, UserRound } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { LABEL_NAMES } from '@/constants/common';
import { ExploreReview } from '@/types/Explore';
import UserInfoDisplay from '@/components/domain/user/UserInfoDisplay';
import Star from '@/components/ui/Display/Star';
import useModalStore from '@/store/modalStore';
import { formatDate } from '@/utils/formatDate';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import ReviewActionDropdown from '@/components/domain/review/ReviewActionDropdown';
import {
  ReviewImageCarousel,
  convertImageUrlsToProductImageArray,
} from '@/components/domain/review/ReviewImageCarousel';
import ReplyButton from '@/components/domain/review/ReplyButton';
import ReviewLikeButton from '@/components/domain/review/ReviewLikeButton';
import Label from '@/components/ui/Display/Label';

interface Props {
  content: ExploreReview;
  priority?: boolean;
  onLikeChange?: (reviewId: number, isLiked: boolean) => void;
}

const ReviewListItem = ({ content, priority = false, onLikeChange }: Props) => {
  const { handleLoginModal } = useModalStore();
  const { isLoggedIn, user: userData } = useAuthSession();
  const [isLiked, setIsLiked] = useState(content.isLikedByMe);
  const [likeCount, setLikeCount] = useState(content.likeCount);
  const [isReportOptionShow, setIsReportOptionShow] = useState(false);
  const productImages = convertImageUrlsToProductImageArray(
    content.reviewImages,
    '리뷰 이미지',
  );
  const reviewTags = [...new Set(content.reviewTags)];

  useEffect(() => {
    setIsLiked(content.isLikedByMe);
    setLikeCount(content.likeCount);
  }, [content.isLikedByMe, content.likeCount]);

  return (
    <>
      <article className="flex w-full flex-col pt-[30px] text-fg-neutral">
        {/* 유저 정보 */}
        <div className="flex flex-col gap-[9px] mb-5">
          <div className="flex justify-between items-center w-full">
            <UserInfoDisplay
              userId={content.userInfo.userId}
              nickName={content.userInfo.nickName}
              userImageProps={{
                imgSrc: content.userInfo.userProfileImage,
                size: 30,
              }}
              userNickNameProps={{
                size: 13,
                color: 'mainGray',
                className: 'text-fg-neutral-muted',
              }}
            />
            <Star
              rating={content.reviewRating ?? 0}
              size={21}
              textStyle="w-7 text-20 font-semibold text-fg-rating"
            />
          </div>
          <div className="flex justify-between items-start w-full gap-2">
            <Link
              href={ROUTES.SEARCH.ALL(content.alcoholId)}
              className="min-w-0 flex-1"
            >
              <p className="break-words text-13 text-fg-neutral">{`${content.alcoholName}  >`}</p>
            </Link>

            <div className="flex gap-1 flex-shrink-0">
              {content.isBestReview && (
                <Label
                  name={LABEL_NAMES.BEST}
                  icon={
                    <ThumbsUp
                      aria-hidden
                      className="h-2.5 w-2.5 fill-current"
                    />
                  }
                  styleClass="rounded border-stroke-brand-primary-solid bg-bg-brand-primary-solid px-2 py-[0.1rem] text-10 text-fg-brand-contrast"
                />
              )}
              {content.isMyReview && (
                <Label
                  name={LABEL_NAMES.MY_REVIEW}
                  icon={<UserRound aria-hidden className="h-2.5 w-2.5" />}
                  styleClass="rounded border-stroke-brand-primary-solid bg-transparent px-2 py-[0.1rem] text-10 text-fg-brand-primary"
                />
              )}
            </div>
          </div>
        </div>

        {/* 리뷰 본문 */}
        <Link href={ROUTES.REVIEW.DETAIL(content.reviewId)}>
          <div className="flex flex-col gap-[14px]">
            <ReviewImageCarousel images={productImages} priority={priority} />
            <div
              className="whitespace-pre-line break-words text-15 text-fg-neutral"
              dangerouslySetInnerHTML={{
                __html: content.reviewContent.replace(/\n/g, '<br />'),
              }}
            />
            <div className="flex flex-wrap gap-[6px]">
              {reviewTags.map((tag) => (
                <div key={tag} className="overflow-hidden flex-shrink-0">
                  <Label name={tag} styleClass="label-default text-13" />
                </div>
              ))}
            </div>
          </div>
        </Link>

        {/* 리뷰 좋아요, 댓글 */}
        <div className="flex items-center justify-between mt-[14px]">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-[2px]">
              <ReviewLikeButton
                reviewId={content.reviewId}
                isLiked={isLiked}
                handleUpdateLiked={() => {
                  const nextIsLiked = !isLiked;
                  setIsLiked(nextIsLiked);
                  setLikeCount((prev) =>
                    Math.max(0, prev + (nextIsLiked ? 1 : -1)),
                  );
                  onLikeChange?.(content.reviewId, nextIsLiked);
                }}
                onApiError={() => {
                  setLikeCount(content.likeCount);
                  setIsLiked(content.isLikedByMe);
                  onLikeChange?.(content.reviewId, content.isLikedByMe);
                }}
                handleNotLogin={handleLoginModal}
                cancelOnUnmount={false}
                size={17}
              />
              <p className="text-13 text-fg-neutral-muted">{likeCount}</p>
            </div>
            <ReplyButton
              reviewId={content.reviewId}
              replyCount={content.replyCount}
              hasReplyByMe={content.hasReplyByMe}
              size={17}
              textSize="text-13"
            />
          </div>
          <div className="flex items-center space-x-1">
            <p className="text-13 text-fg-neutral-muted">
              {formatDate(content.createAt) as string}
            </p>
            <button
              className="cursor-pointer rounded-sm text-fg-neutral-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
              aria-label="리뷰 메뉴"
              onClick={() => {
                if (isLoggedIn) setIsReportOptionShow(true);
                else handleLoginModal();
              }}
            >
              <Ellipsis aria-hidden className="h-[17px] w-[17px]" />
            </button>
          </div>
        </div>
      </article>
      <ReviewActionDropdown
        isShow={isReportOptionShow}
        onClose={() => setIsReportOptionShow(false)}
        isOwnReview={userData?.userId === content.userInfo.userId}
        reviewId={String(content.reviewId)}
        userId={String(content.userInfo.userId)}
        userNickname={content.userInfo.nickName}
        alcoholId={content.alcoholId}
      />
    </>
  );
};

export default memo(ReviewListItem);
